"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleWishlist(
  productId: string
): Promise<{ success: boolean; wishlisted?: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not logged in" };

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await db.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { success: true, wishlisted: false };
  } else {
    await db.wishlist.create({ data: { userId: session.user.id, productId } });
    revalidatePath("/account/wishlist");
    return { success: true, wishlisted: true };
  }
}

export async function getWishlistProductIds(): Promise<string[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const items = await db.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}
