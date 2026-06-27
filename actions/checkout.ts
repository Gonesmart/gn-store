"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { shippingSchema, type ShippingFormData } from "@/lib/validations/checkout";
import { z } from "zod";
import type { CouponType } from "@prisma/client";
import {
  PAYSTACK_SECRET_KEY,
  PAYSTACK_BASE_URL,
  formatPaystackAmount,
} from "@/lib/paystack";

const CART_COOKIE = "gn_cart_session";

export type CouponResult =
  | { valid: true; code: string; type: CouponType; value: number; discountAmount: number; couponId: string }
  | { valid: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  if (!code.trim()) return { valid: false, error: "Enter a coupon code." };

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Invalid or expired coupon code." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }
  const minOrder = coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount.toString()) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order amount for this coupon is ₦${minOrder.toLocaleString()}.`,
    };
  }

  const couponValue = parseFloat(coupon.value.toString());
  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * couponValue) / 100)
      : Math.min(couponValue, subtotal);

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: couponValue,
    discountAmount,
    couponId: coupon.id,
  };
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GN-${ts}-${rand}`;
}

const createOrderSchema = z.object({
  shipping: shippingSchema,
  couponCode: z.string().optional(),
});

export type CreateOrderResult =
  | { success: true; orderNumber: string; orderId: string }
  | { success: false; error: string };

export async function createOrder(input: {
  shipping: ShippingFormData;
  couponCode?: string;
}): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { shipping, couponCode } = parsed.data;

  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) return { success: false, error: "Your cart is empty." };

  const session = await auth.api.getSession({ headers: await headers() });

  try {
    // Load cart
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (cartItems.length === 0) return { success: false, error: "Your cart is empty." };

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.variant.price.toString()) * item.quantity,
      0
    );

    // Validate coupon
    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode?.trim()) {
      const couponRes = await validateCoupon(couponCode, subtotal);
      if (!couponRes.valid) return { success: false, error: couponRes.error };
      discountAmount = couponRes.discountAmount;
      couponId = couponRes.couponId;
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Shipping address JSON
    const shippingAddress = {
      fullName: shipping.fullName,
      email: shipping.email,
      phone: shipping.phone,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2 ?? null,
      city: shipping.city,
      state: shipping.state,
      country: shipping.country,
    };

    // Build variant label helper
    function variantLabel(v: { color: string | null; size: string | null }): string {
      const parts = [v.color, v.size].filter(Boolean);
      return parts.length > 0 ? parts.join(" / ") : "Default";
    }

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session?.user?.id ?? null,
          guestEmail: session ? null : shipping.email,
          status: "PENDING",
          subtotal,
          discountAmount,
          taxAmount: 0,
          shippingAmount: 0,
          total,
          couponId,
          paymentStatus: "UNPAID",
          shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.variant.product.id,
              variantId: item.variantId,
              productName: item.variant.product.name,
              variantLabel: variantLabel(item.variant),
              price: item.variant.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { sessionId } });

      return newOrder;
    });

    return { success: true, orderNumber: order.orderNumber, orderId: order.id };
  } catch (err) {
    console.error("createOrder error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Paystack payment initialization ─────────────────────────────────────────

export type InitPaymentResult =
  | { success: true; authorizationUrl: string }
  | { success: false; error: string };

export async function initializePayment(input: {
  shipping: ShippingFormData;
  couponCode?: string;
}): Promise<InitPaymentResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { shipping, couponCode } = parsed.data;

  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) return { success: false, error: "Your cart is empty." };

  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (cartItems.length === 0) return { success: false, error: "Your cart is empty." };

    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.variant.price.toString()) * item.quantity,
      0
    );

    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode?.trim()) {
      const couponRes = await validateCoupon(couponCode, subtotal);
      if (!couponRes.valid) return { success: false, error: couponRes.error };
      discountAmount = couponRes.discountAmount;
      couponId = couponRes.couponId;
    }

    const total = Math.max(0, subtotal - discountAmount);

    const paystackRef = `GN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const shippingAddress = {
      fullName: shipping.fullName,
      email: shipping.email,
      phone: shipping.phone,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2 ?? null,
      city: shipping.city,
      state: shipping.state,
      country: shipping.country,
    };

    function variantLabel(v: { color: string | null; size: string | null }): string {
      const parts = [v.color, v.size].filter(Boolean);
      return parts.length > 0 ? parts.join(" / ") : "Default";
    }

    // Create order — cart and coupon increment are handled after payment is verified
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id ?? null,
        guestEmail: session ? null : shipping.email,
        status: "PENDING",
        subtotal,
        discountAmount,
        taxAmount: 0,
        shippingAmount: 0,
        total,
        couponId,
        paymentStatus: "UNPAID",
        paystackRef,
        shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            productId: item.variant.product.id,
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantLabel: variantLabel(item.variant),
            price: item.variant.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Call Paystack initialize
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const paystackRes = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: shipping.email,
        amount: formatPaystackAmount(total),
        reference: paystackRef,
        callback_url: `${appUrl}/checkout/verify`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          custom_fields: [
            { display_name: "Order Number", variable_name: "order_number", value: order.orderNumber },
            { display_name: "Customer Name", variable_name: "customer_name", value: shipping.fullName },
          ],
        },
      }),
    });

    const paystackJson = await paystackRes.json();

    if (!paystackJson.status || !paystackJson.data?.authorization_url) {
      // Paystack init failed — delete the pending order
      await db.order.delete({ where: { id: order.id } });
      return { success: false, error: "Could not initialize payment. Please try again." };
    }

    return { success: true, authorizationUrl: paystackJson.data.authorization_url };
  } catch (err) {
    console.error("initializePayment error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
