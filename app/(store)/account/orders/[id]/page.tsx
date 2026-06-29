import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package } from "lucide-react";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      discountAmount: true,
      shippingAmount: true,
      total: true,
      paystackRef: true,
      trackingNumber: true,
      createdAt: true,
      shippingAddress: true,
      userId: true,
      items: {
        select: {
          id: true,
          productName: true,
          variantLabel: true,
          price: true,
          quantity: true,
          product: { select: { slug: true } },
        },
      },
    },
  });

  // Ensure order belongs to the logged-in user
  if (!order || order.userId !== session.user.id) notFound();

  const addr = order.shippingAddress as Record<string, string>;
  const subtotal = parseFloat(order.subtotal.toString());
  const discount = parseFloat(order.discountAmount.toString());
  const shipping = parseFloat(order.shippingAmount.toString());
  const total = parseFloat(order.total.toString());

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/account/orders"
        className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700 dark:text-[#555] dark:hover:text-[#A3A3A3]"
      >
        <ArrowLeft size={14} />
        All orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-black text-gray-900 dark:text-white">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor(order.status)}`}>
            {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
          </span>
          {order.paymentStatus === "PAID" && (
            <span className="rounded-full bg-[#5DC600]/10 px-3 py-1 text-sm font-semibold text-[#5DC600]">
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Tracking number if shipped */}
      {order.trackingNumber && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm dark:border-blue-900/30 dark:bg-blue-950/20">
          <span className="font-semibold text-blue-700 dark:text-blue-400">Tracking: </span>
          <span className="font-mono text-blue-700 dark:text-blue-400">{order.trackingNumber}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-[#2A2A2A]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
                Items
              </p>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#111]">
                    <Package size={16} className="text-gray-300 dark:text-[#3A3A3A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-[#5DC600] dark:text-white dark:hover:text-[#5DC600]"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">
                      {item.variantLabel} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(parseFloat(item.price.toString()) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary + Address */}
        <div className="flex flex-col gap-4">
          {/* Price breakdown */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
              Summary
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-[#A3A3A3]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#5DC600]">
                  <span>Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-[#A3A3A3]">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-100 pt-3 font-bold dark:border-[#2A2A2A]">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-[#5DC600]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
              Delivering to
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{addr.fullName}</p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#A3A3A3]">
              {addr.addressLine1}
              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
            </p>
            <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
              {addr.city}, {addr.state}
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-[#555]">{addr.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
