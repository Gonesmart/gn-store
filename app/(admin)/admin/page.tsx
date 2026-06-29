import { Suspense } from "react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function formatNaira(amount: { toString(): string } | number | null | undefined) {
  const n = parseFloat(String(amount ?? 0));
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

async function DashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayRevenue,
    monthRevenue,
    totalOrders,
    totalCustomers,
    recentOrders,
    lowStockCount,
  ] = await Promise.all([
    db.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        guestEmail: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.productVariant.count({ where: { stock: { lte: 5 } } }),
  ]);

  const stats = [
    {
      label: "Revenue Today",
      value: formatNaira(todayRevenue._sum.total ?? 0),
      icon: TrendingUp,
      sub: "Paid orders only",
    },
    {
      label: "Revenue This Month",
      value: formatNaira(monthRevenue._sum.total ?? 0),
      icon: TrendingUp,
      sub: "Paid orders only",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      sub: "All time",
    },
    {
      label: "Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      sub: "Registered accounts",
    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="border-[#2A2A2A] bg-[#1A1A1A] p-5"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#A3A3A3]">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-[#A3A3A3]">{s.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5DC600]/10">
                  <Icon className="h-5 w-5 text-[#5DC600]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <Package className="h-4 w-4 shrink-0 text-yellow-400" />
          <p className="text-sm text-yellow-300">
            <span className="font-semibold">{lowStockCount}</span> variant
            {lowStockCount !== 1 ? "s are" : " is"} low on stock (≤5 units).{" "}
            <a href="/admin/products" className="underline hover:text-yellow-200">
              Review products →
            </a>
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-sm text-[#5DC600] hover:text-[#7DE620] transition-colors duration-150"
          >
            View all →
          </a>
        </div>
        <Card
          className="border-[#2A2A2A] bg-[#1A1A1A] overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <RecentOrdersTable
            orders={recentOrders.map((o) => ({
              ...o,
              total: formatNaira(o.total),
              createdAt: o.createdAt.toISOString(),
            }))}
          />
        </Card>
      </div>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-[#2A2A2A] bg-[#1A1A1A] p-5">
            <Skeleton className="h-4 w-28 bg-[#2A2A2A]" />
            <Skeleton className="mt-3 h-8 w-36 bg-[#2A2A2A]" />
            <Skeleton className="mt-2 h-3 w-20 bg-[#2A2A2A]" />
          </Card>
        ))}
      </div>
      <Card className="border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <Skeleton className="h-5 w-32 bg-[#2A2A2A] mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-[#2A2A2A]" />
          ))}
        </div>
      </Card>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Welcome back. Here&apos;s what&apos;s happening at GN Store.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
