"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";

export type AdminNotification = {
  id: string;
  type: "new_order" | "new_customer";
  title: string;
  body: string;
  link: string;
  createdAt: Date;
};

// Cached DB fetch — keyed per userId, revalidates every 30 seconds.
// Auth check happens outside this function so the cached function
// never receives dynamic headers.
const fetchNotificationsForUser = unstable_cache(
  async (userId: string): Promise<AdminNotification[]> => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [orders, customers] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: since } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.user.findMany({
        where: { role: "CUSTOMER", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const notifications: AdminNotification[] = [
      ...orders.map((o) => ({
        id: `order-${o.id}`,
        type: "new_order" as const,
        title: "New order placed",
        body: `${o.user?.name ?? "A customer"} placed ${o.orderNumber}`,
        link: `/admin/orders/${o.id}`,
        createdAt: o.createdAt,
      })),
      ...customers.map((u) => ({
        id: `customer-${u.id}`,
        type: "new_customer" as const,
        title: "New customer signed up",
        body: u.name ?? u.email,
        link: `/admin/customers`,
        createdAt: u.createdAt,
      })),
    ];

    return notifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  },
  ["admin-notifications"],
  { revalidate: 30, tags: ["admin-notifications"] }
);

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") return [];

  // Pass userId as part of the cache key so different admins are isolated
  return fetchNotificationsForUser(session.user.id);
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false };
  }
  return { success: true };
}
