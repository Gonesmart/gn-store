"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function approveReview(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const review = await db.review.update({
      where: { id },
      data: { approved: true },
      select: { product: { select: { slug: true } } },
    });
    revalidatePath(`/products/${review.product.slug}`);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to approve review." };
  }
}

export async function deleteReview(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const review = await db.review.delete({
      where: { id },
      select: { product: { select: { slug: true } } },
    });
    revalidatePath(`/products/${review.product.slug}`);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete review." };
  }
}
