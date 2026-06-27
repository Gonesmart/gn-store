import { Suspense } from "react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function formatNaira(amount: { toString(): string } | number | null | undefined) {
  const n = parseFloat(String(amount ?? 0));
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function getOrderStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    PROCESSING: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    SHIPPED: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    DELIVERED: "bg-[#5DC600]/15 text-[#5DC600] border-[#5DC600]/30",
    CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return map[status] ?? "bg-[#2A2A2A] text-[#A3A3A3]";
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
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-[#2A2A2A] mb-3" />
              <p className="text-sm font-medium text-[#A3A3A3]">No orders yet</p>
              <p className="text-xs text-[#4A4A4A] mt-1">
                Orders will appear here once customers start purchasing.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                  <TableHead className="text-[#A3A3A3]">Order</TableHead>
                  <TableHead className="text-[#A3A3A3]">Customer</TableHead>
                  <TableHead className="text-[#A3A3A3]">Status</TableHead>
                  <TableHead className="text-right text-[#A3A3A3]">Total</TableHead>
                  <TableHead className="text-[#A3A3A3]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-[#2A2A2A] hover:bg-[#242424] cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/admin/orders/${order.id}`)
                    }
                  >
                    <TableCell className="font-medium text-white">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-[#A3A3A3]">
                      {order.user?.name ?? order.guestEmail ?? "Guest"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                      >
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-white">
                      {formatNaira(order.total)}
                    </TableCell>
                    <TableCell className="text-[#A3A3A3] text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
