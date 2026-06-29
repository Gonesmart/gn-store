import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json([], { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [orders, customers, reviews] = await Promise.all([
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
    db.review.findMany({
      where: { approved: false, createdAt: { gte: since } },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const notifications = [
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
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      type: "pending_review" as const,
      title: "Review awaiting approval",
      body: `${r.user.name ?? "A customer"} reviewed ${r.product.name}`,
      link: `/admin/reviews`,
      createdAt: r.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(notifications, {
    headers: { "Cache-Control": "no-store" },
  });
}
