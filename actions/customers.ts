"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function deleteCustomer(
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const user = await db.user.findUnique({
      where: { id: customerId },
      select: { role: true },
    });

    if (!user) return { success: false, error: "Customer not found" };
    if (user.role === "ADMIN") {
      return { success: false, error: "Cannot delete admin accounts" };
    }

    await db.user.delete({ where: { id: customerId } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete customer" };
  }
}
