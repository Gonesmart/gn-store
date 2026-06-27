"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15)
    .regex(/^[\d+\-\s()]+$/, "Enter a valid phone number"),
  addressLine1: z.string().min(5, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().default("Nigeria"),
});

export type AddressInput = z.infer<typeof addressSchema>;

type ActionResult = { success: true } | { success: false; error: string };

export async function addAddress(input: AddressInput): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await db.address.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const updated = await db.address.updateMany({
    where: { id, userId: session.user.id },
    data: parsed.data,
  });
  if (updated.count === 0) return { success: false, error: "Address not found." };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await requireAuth();
  await db.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const session = await requireAuth();
  await db.$transaction([
    db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    db.address.updateMany({
      where: { id, userId: session.user.id },
      data: { isDefault: true },
    }),
  ]);
  revalidatePath("/account/addresses");
  return { success: true };
}
