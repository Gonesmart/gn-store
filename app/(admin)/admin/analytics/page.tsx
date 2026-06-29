import { TrendingUp, ShoppingCart, Users, Package, BarChart3 } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  PROCESSING: "#3B82F6",
  SHIPPED: "#8B5CF6",
  DELIVERED: "#5DC600",
  CANCELLED: "#EF4444",
};

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Go back 6 months from the start of the current month
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    allTimeRevenue,
    monthRevenue,
    totalOrders,
    totalCustomers,
    statusCounts,
    recentPaidOrders,
    orderItems,
    lowStockCount,
  ] = await Promise.all([
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
      _count: { id: true },
    }),
    db.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: sixMonthsAgo } },
      select: { total: true, createdAt: true },
    }),
    db.orderItem.findMany({
      where: { order: { paymentStatus: "PAID" } },
      select: {
        productId: true,
        productName: true,
        price: true,
        quantity: true,
      },
    }),
    db.productVariant.count({ where: { stock: { lte: 5 } } }),
  ]);

  const paidOrderCount = allTimeRevenue._count.id;
  const totalRevenueNum = Number(allTimeRevenue._sum.total ?? 0);
  const monthRevenueNum = Number(monthRevenue._sum.total ?? 0);
  const avgOrderValue = paidOrderCount > 0 ? totalRevenueNum / paidOrderCount : 0;

  // Monthly revenue — last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("en-NG", { month: "short" });
    const revenue = recentPaidOrders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      })
      .reduce((sum, o) => sum + Number(o.total), 0);
    return { label, revenue };
  });

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  // Order status breakdown
  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status])
  ) as Record<string, number>;
  const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const statusTotal = Object.values(statusMap).reduce((a, b) => a + b, 0) || 1;

  // Top 5 products by revenue
  const productMap = new Map<string, { name: string; revenue: number; units: number }>();
  for (const item of orderItems) {
    const existing = productMap.get(item.productId) ?? {
      name: item.productName,
      revenue: 0,
      units: 0,
    };
    existing.revenue += Number(item.price) * item.quantity;
    existing.units += item.quantity;
    productMap.set(item.productId, existing);
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  const statCards = [
    {
      label: "All-time revenue",
      value: formatCurrency(totalRevenueNum),
      sub: `${paidOrderCount} paid orders`,
      icon: TrendingUp,
    },
    {
      label: "This month",
      value: formatCurrency(monthRevenueNum),
      sub: new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
      icon: TrendingUp,
    },
    {
      label: "Avg. order value",
      value: formatCurrency(avgOrderValue),
      sub: "Paid orders only",
      icon: ShoppingCart,
    },
    {
      label: "Total orders",
      value: totalOrders.toLocaleString(),
      sub: "All statuses",
      icon: ShoppingCart,
    },
    {
      label: "Customers",
      value: totalCustomers.toLocaleString(),
      sub: "Registered accounts",
      icon: Users,
    },
    {
      label: "Low stock",
      value: lowStockCount.toLocaleString(),
      sub: "Variants ≤ 5 units",
      icon: Package,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">Revenue and order insights</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
          <BarChart3 className="h-4 w-4 text-[#5DC600]" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="border-[#2A2A2A] bg-[#1A1A1A] p-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5DC600]/10 mb-3">
                <Icon className="h-4 w-4 text-[#5DC600]" />
              </div>
              <p className="text-xs text-[#A3A3A3]">{s.label}</p>
              <p className="mt-1 text-lg font-bold tracking-tight text-white leading-tight">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-[#4A4A4A]">{s.sub}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly revenue chart */}
        <div
          className="lg:col-span-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)" }}
        >
          <h2 className="mb-6 text-sm font-semibold text-white">Monthly revenue</h2>
          <div className="flex h-40 items-end gap-3">
            {monthlyData.map((m) => {
              const heightPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={m.label} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center h-32">
                    <div
                      className="w-full rounded-t-md bg-[#5DC600]/80 transition-all duration-300 group-hover:bg-[#5DC600]"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={formatCurrency(m.revenue)}
                    />
                    {m.revenue > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#2A2A2A] px-1.5 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {formatCurrency(m.revenue)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#A3A3A3]">{m.label}</span>
                </div>
              );
            })}
          </div>
          {maxRevenue === 1 && (
            <p className="mt-4 text-center text-xs text-[#4A4A4A]">
              No paid orders in the last 6 months
            </p>
          )}
        </div>

        {/* Order status breakdown */}
        <div
          className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)" }}
        >
          <h2 className="mb-6 text-sm font-semibold text-white">Order status</h2>
          {totalOrders === 0 ? (
            <p className="text-center text-xs text-[#4A4A4A] mt-8">No orders yet</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {statusOrder.map((status) => {
                const count = statusMap[status] ?? 0;
                const pct = Math.round((count / statusTotal) * 100);
                const color = ORDER_STATUS_COLORS[status];
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-[#A3A3A3]">
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div
        className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)" }}
      >
        <h2 className="mb-6 text-sm font-semibold text-white">Top products by revenue</h2>
        {topProducts.length === 0 ? (
          <p className="text-center text-xs text-[#4A4A4A]">No sales data yet</p>
        ) : (
          <div className="flex flex-col gap-4">
            {topProducts.map((product, i) => {
              const barPct = (product.revenue / maxProductRevenue) * 100;
              return (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="w-5 shrink-0 text-right text-xs font-bold text-[#4A4A4A]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {product.name}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-white">
                          {formatCurrency(product.revenue)}
                        </p>
                        <p className="text-[10px] text-[#4A4A4A]">
                          {product.units} unit{product.units !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                      <div
                        className="h-full rounded-full bg-[#5DC600]"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
