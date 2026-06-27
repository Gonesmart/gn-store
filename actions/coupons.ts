"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { couponSchema } from "@/lib/validations/coupon";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createCoupon(rawData: unknown) {
  try {
    await requireAdmin();
    const data = couponSchema.parse(rawData);

    const existing = await db.coupon.findUnique({ where: { code: data.code } });
    if (existing) return { success: false as const, error: "Coupon code already exists" };

    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: data.active,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true as const, data: coupon };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false as const, error: err.issues[0].message };
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to create coupon",
    };
  }
}

export async function updateCoupon(id: string, rawData: unknown) {
  try {
    await requireAdmin();
    const data = couponSchema.parse(rawData);

    const conflict = await db.coupon.findFirst({
      where: { code: data.code, NOT: { id } },
    });
    if (conflict) return { success: false as const, error: "Coupon code already taken" };

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: data.active,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true as const, data: coupon };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false as const, error: err.issues[0].message };
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update coupon",
    };
  }
}

export async function toggleCoupon(id: string, active: boolean) {
  try {
    await requireAdmin();
    const coupon = await db.coupon.update({ where: { id }, data: { active } });
    revalidatePath("/admin/coupons");
    return { success: true as const, data: coupon };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to toggle coupon",
    };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin();

    const usage = await db.order.count({ where: { couponId: id } });
    if (usage > 0) {
      return {
        success: false as const,
        error: `Cannot delete — this coupon has been used in ${usage} order${usage !== 1 ? "s" : ""}`,
      };
    }

    await db.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to delete coupon",
    };
  }
}
