"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export interface OrdersFilter {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getOrders(filter: OrdersFilter = {}) {
  await requireAdmin();

  const { status, search, page = 1, pageSize = 20 } = filter;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { guestEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getOrderById(id: string) {
  await requireAdmin();

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { slug: true, images: { take: 1, orderBy: { position: "asc" } } } },
        },
      },
      coupon: { select: { code: true, type: true, value: true } },
    },
  });

  return order;
}

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function updateOrderStatus(id: string, rawStatus: string) {
  try {
    await requireAdmin();

    const { status } = updateStatusSchema.parse({ status: rawStatus });

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true as const, data: order };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update status",
    };
  }
}

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
});

export async function updateTrackingNumber(id: string, trackingNumber: string) {
  try {
    await requireAdmin();

    const parsed = trackingSchema.parse({ trackingNumber });

    const order = await db.order.update({
      where: { id },
      data: {
        trackingNumber: parsed.trackingNumber,
        status: "SHIPPED",
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true as const, data: order };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update tracking number",
    };
  }
}

const notesSchema = z.object({
  notes: z.string(),
});

export async function updateOrderNotes(id: string, notes: string) {
  try {
    await requireAdmin();
    const parsed = notesSchema.parse({ notes });

    const order = await db.order.update({
      where: { id },
      data: { notes: parsed.notes },
    });

    revalidatePath(`/admin/orders/${id}`);
    return { success: true as const, data: order };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to save notes",
    };
  }
}

export async function cancelOrder(id: string) {
  try {
    await requireAdmin();

    const existing = await db.order.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { success: false as const, error: "Order not found" };
    if (existing.status === "DELIVERED") {
      return { success: false as const, error: "Cannot cancel a delivered order" };
    }

    const order = await db.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true as const, data: order };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to cancel order",
    };
  }
}
