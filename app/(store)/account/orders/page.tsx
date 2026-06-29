import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";

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

function paymentBadge(status: string) {
  if (status === "PAID") return "bg-[#5DC600]/10 text-[#5DC600]";
  if (status === "REFUNDED") return "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
  return "bg-gray-100 text-gray-500 dark:bg-[#2A2A2A] dark:text-[#A3A3A3]";
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Order History</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-[#2A2A2A]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
            <Package size={24} className="text-gray-300 dark:text-[#3A3A3A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">No orders yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
              When you place an order it will appear here.
            </p>
          </div>
          <Link
            href="/shop"
            className="rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#4DAF00]"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:hover:border-[#3A3A3A] dark:hover:bg-[#222]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(order.status)}`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-[#A3A3A3]">
                      {itemCount} item{itemCount !== 1 ? "s" : ""} &middot;{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(parseFloat(order.total.toString()))}
                    </p>
                    <ChevronRight size={16} className="text-gray-300 dark:text-[#3A3A3A]" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
