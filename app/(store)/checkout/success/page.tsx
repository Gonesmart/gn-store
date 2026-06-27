import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  let order: {
    orderNumber: string;
    total: string;
    status: string;
    items: { productName: string; variantLabel: string; quantity: number; price: string }[];
    shippingAddress: Record<string, string>;
  } | null = null;

  if (orderNumber) {
    const raw = await db.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        total: true,
        status: true,
        shippingAddress: true,
        items: {
          select: {
            productName: true,
            variantLabel: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (raw) {
      order = {
        orderNumber: raw.orderNumber,
        total: raw.total.toString(),
        status: raw.status,
        shippingAddress: raw.shippingAddress as Record<string, string>,
        items: raw.items.map((i) => ({
          ...i,
          price: i.price.toString(),
        })),
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5DC600]/15">
          <CheckCircle2 size={40} className="text-[#5DC600]" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-black text-gray-900 dark:text-white">
        Order Placed!
      </h1>
      <p className="mt-2 text-gray-500 dark:text-[#A3A3A3]">
        Thank you for shopping with GN Store. We&apos;ll start preparing your order right away.
      </p>

      {order && (
        <>
          {/* Order number */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
                  Order Number
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold text-[#5DC600]">
                  {order.orderNumber}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5DC600]/10">
                <Package size={18} className="text-[#5DC600]" />
              </div>
            </div>

            {/* Items */}
            <ul className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-[#2A2A2A]">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </span>
                    <span className="ml-1.5 text-gray-400 dark:text-[#A3A3A3]">
                      ({item.variantLabel}) &times; {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(parseFloat(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Total */}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-[#2A2A2A]">
              <span className="font-bold text-gray-900 dark:text-white">Total paid</span>
              <span className="text-lg font-black text-[#5DC600]">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(parseFloat(order.total))}
              </span>
            </div>

            {/* Shipping address */}
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-[#2A2A2A]">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#555]">
                Delivering to
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ""}
                , {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>
          </div>

          {/* Email notice */}
          <p className="mt-5 text-sm text-gray-400 dark:text-[#555]">
            A confirmation email will be sent to{" "}
            <span className="font-medium text-gray-600 dark:text-[#A3A3A3]">
              {order.shippingAddress.email}
            </span>
          </p>
        </>
      )}

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#5DC600] px-8 py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
        >
          <ShoppingBag size={17} />
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl border border-gray-200 px-8 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A] dark:hover:text-white"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
