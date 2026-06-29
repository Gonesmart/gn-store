import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import type { Metadata } from "next";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Orders" };

const PAGE_SIZE = 20;

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

function formatCurrency(amount: { toNumber(): number } | number): string {
  const n = typeof amount === "number" ? amount : amount.toNumber();
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = ALL_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const search = params.search?.trim() || undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
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

  const [orders, total, statusCounts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    db.order.count({ where }),
    db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status])
  ) as Partial<Record<OrderStatus, number>>;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search ? { search } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Orders</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            {total} order{total !== 1 ? "s" : ""}
            {statusFilter ? ` - ${statusFilter.toLowerCase()}` : ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
          <ShoppingBag className="h-4 w-4 text-[#5DC600]" />
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <form method="GET" action="/admin/orders" className="flex-1">
            {statusFilter && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search by order number, customer name or email…"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#5DC600] focus:outline-none"
            />
          </form>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildUrl({ status: undefined, page: undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !statusFilter
                  ? "border-[#5DC600]/40 bg-[#5DC600]/15 text-[#5DC600]"
                  : "border-[#2A2A2A] text-[#A3A3A3] hover:border-[#3A3A3A] hover:text-white"
              }`}
            >
              All ({total + Object.values(countByStatus).reduce((a, b) => a - b, total) >= 0 ? total : total})
            </Link>
            {ALL_STATUSES.map((s) => (
              <Link
                key={s}
                href={buildUrl({ status: s, page: undefined })}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "border-[#5DC600]/40 bg-[#5DC600]/15 text-[#5DC600]"
                    : "border-[#2A2A2A] text-[#A3A3A3] hover:border-[#3A3A3A] hover:text-white"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()} ({countByStatus[s] ?? 0})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="mb-4 h-10 w-10 text-[#A3A3A3] opacity-40" />
            <p className="text-sm font-medium text-[#A3A3A3]">No orders found</p>
            {(search || statusFilter) && (
              <Link
                href="/admin/orders"
                className="mt-2 text-xs text-[#5DC600] hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Order", "Customer", "Items", "Total", "Status", "Payment", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-[#A3A3A3]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const customer = order.user
                    ? { name: order.user.name, email: order.user.email }
                    : { name: "Guest", email: order.guestEmail ?? "-" };
                  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-[#2A2A2A] transition-colors hover:bg-[#0D0D0D] ${
                        idx === orders.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-white">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-xs text-[#A3A3A3]">{customer.email}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#A3A3A3]">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <PaymentStatusBadge status={order.paymentStatus} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#A3A3A3]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-1 text-xs text-[#5DC600] hover:underline"
                        >
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-[#A3A3A3]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
