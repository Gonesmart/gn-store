"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/validations/reviews";

type ReviewResult =
  | { success: true }
  | { success: false; error: string };

export async function submitReview(input: unknown): Promise<ReviewResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "You must be signed in to leave a review." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { productId, rating, title, body } = parsed.data;

  try {
    await db.review.upsert({
      where: {
        productId_userId: { productId, userId: session.user.id },
      },
      create: {
        productId,
        userId: session.user.id,
        rating,
        title: title ?? null,
        body,
      },
      update: {
        rating,
        title: title ?? null,
        body,
      },
    });

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });
    if (product) revalidatePath(`/products/${product.slug}`);

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
