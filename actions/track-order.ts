"use server";

import { db } from "@/lib/db";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber: string | null;
  createdAt: string;
  total: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    phone: string;
  };
  items: {
    productName: string;
    variantLabel: string;
    quantity: number;
    price: number;
    slug: string | null;
  }[];
};

export async function trackOrder(
  orderNumber: string
): Promise<{ success: true; order: TrackedOrder } | { success: false; error: string }> {
  const trimmed = orderNumber.trim().toUpperCase();
  if (!trimmed) {
    return { success: false, error: "Please enter an order number." };
  }

  try {
    const order = await db.order.findUnique({
      where: { orderNumber: trimmed },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        createdAt: true,
        total: true,
        shippingAddress: true,
        items: {
          select: {
            productName: true,
            variantLabel: true,
            quantity: true,
            price: true,
            product: { select: { slug: true } },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error:
          "No order found with that number. Double-check the number in your confirmation email.",
      };
    }

    const addr = order.shippingAddress as Record<string, string>;

    return {
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt.toISOString(),
        total: parseFloat(order.total.toString()),
        shippingAddress: {
          fullName: addr.fullName ?? "",
          addressLine1: addr.addressLine1 ?? "",
          addressLine2: addr.addressLine2,
          city: addr.city ?? "",
          state: addr.state ?? "",
          phone: addr.phone ?? "",
        },
        items: order.items.map((i) => ({
          productName: i.productName,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          price: parseFloat(i.price.toString()),
          slug: i.product?.slug ?? null,
        })),
      },
    };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
