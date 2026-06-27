"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

const CART_COOKIE = "gn_cart_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CartItemData = {
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  image: string | null;
  slug: string;
  quantity: number;
  stock: number;
};

async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  let sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(CART_COOKIE, sessionId, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }
  return sessionId;
}

async function fetchCart(sessionId: string): Promise<CartItemData[]> {
  const items = await db.cartItem.findMany({
    where: { sessionId },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return items.map((item) => {
    const v = item.variant;
    const p = v.product;
    const parts = [v.color, v.size].filter(Boolean);
    return {
      variantId: v.id,
      productName: p.name,
      variantLabel: parts.length > 0 ? parts.join(" / ") : "Default",
      price: parseFloat(v.price.toString()),
      image: p.images[0]?.url ?? null,
      slug: p.slug,
      quantity: item.quantity,
      stock: v.stock,
    };
  });
}

export async function getCart(): Promise<CartItemData[]> {
  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) return [];
  try {
    return await fetchCart(sessionId);
  } catch {
    return [];
  }
}

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export async function addToCart(
  variantId: string,
  quantity: number
): Promise<{ success: true; cart: CartItemData[] } | { success: false; error: string }> {
  const parsed = addSchema.safeParse({ variantId, quantity });
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const sessionId = await getOrCreateSessionId();

  try {
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) return { success: false, error: "Product not found." };

    const existing = await db.cartItem.findUnique({
      where: { sessionId_variantId: { sessionId, variantId } },
    });
    const newQty = (existing?.quantity ?? 0) + quantity;
    if (newQty > variant.stock) {
      return {
        success: false,
        error: `Only ${variant.stock} in stock.`,
      };
    }

    await db.cartItem.upsert({
      where: { sessionId_variantId: { sessionId, variantId } },
      create: { sessionId, variantId, quantity },
      update: { quantity: newQty },
    });

    return { success: true, cart: await fetchCart(sessionId) };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

const updateSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export async function updateCartQty(
  variantId: string,
  quantity: number
): Promise<{ success: true; cart: CartItemData[] } | { success: false; error: string }> {
  const parsed = updateSchema.safeParse({ variantId, quantity });
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const sessionId = await getOrCreateSessionId();

  try {
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) return { success: false, error: "Product not found." };
    if (quantity > variant.stock) {
      return { success: false, error: `Only ${variant.stock} in stock.` };
    }

    await db.cartItem.update({
      where: { sessionId_variantId: { sessionId, variantId } },
      data: { quantity },
    });

    return { success: true, cart: await fetchCart(sessionId) };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function removeFromCart(
  variantId: string
): Promise<{ success: true; cart: CartItemData[] } | { success: false; error: string }> {
  if (!variantId) return { success: false, error: "Invalid input." };

  const sessionId = await getOrCreateSessionId();

  try {
    await db.cartItem
      .delete({
        where: { sessionId_variantId: { sessionId, variantId } },
      })
      .catch(() => {});

    return { success: true, cart: await fetchCart(sessionId) };
  } catch {
    return { success: false, error: "Something went wrong." };
  }
}

export async function clearCart(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) return;
  await db.cartItem.deleteMany({ where: { sessionId } }).catch(() => {});
}
