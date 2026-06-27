import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Package, CreditCard, MapPin, ChevronRight } from "lucide-react";

function statusColor(status: string) {
  switch (status) {
    case "PROCESSING": return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
    case "SHIPPED":    return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    case "DELIVERED":  return "bg-[#5DC600]/10 text-[#5DC600]";
    case "CANCELLED":  return "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400";
    case "REFUNDED":   return "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
    default:           return "bg-gray-100 text-gray-500 dark:bg-[#2A2A2A] dark:text-[#A3A3A3]";
  }
}

export default async function AccountDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [recentOrders, totalOrders, addressCount, totalSpent] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
    }),
    db.order.count({ where: { userId: session.user.id } }),
    db.address.count({ where: { userId: session.user.id } }),
    db.order.aggregate({
      where: { userId: session.user.id, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const spent = parseFloat((totalSpent._sum.total ?? 0).toString());

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
          Here&apos;s a summary of your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5DC600]/10">
            <Package size={18} className="text-[#5DC600]" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalOrders}</p>
            <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">Total orders</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5DC600]/10">
            <CreditCard size={18} className="text-[#5DC600]" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{formatPrice(spent)}</p>
            <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">Total spent</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5DC600]/10">
            <MapPin size={18} className="text-[#5DC600]" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{addressCount}</p>
            <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">Saved addresses</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-sm font-medium text-[#5DC600] hover:underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-[#2A2A2A]">
            <p className="text-sm text-gray-400 dark:text-[#A3A3A3]">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-xl bg-[#5DC600] px-5 py-2 text-sm font-bold text-black hover:bg-[#4DAF00]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-[#3A3A3A] dark:hover:bg-[#222]"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-[#A3A3A3]">
                        {itemCount} item{itemCount !== 1 ? "s" : ""} &middot;{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(order.status)}`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(parseFloat(order.total.toString()))}
                      </p>
                      <ChevronRight size={15} className="text-gray-300 dark:text-[#3A3A3A]" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
