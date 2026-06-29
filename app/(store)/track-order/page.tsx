"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  MapPin,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { trackOrder, type TrackedOrder } from "@/actions/track-order";
import { formatPrice } from "@/lib/utils";

type Status = TrackedOrder["status"];

const STEPS: { status: Status; label: string; desc: string }[] = [
  { status: "PENDING", label: "Order Placed", desc: "We received your order" },
  { status: "PROCESSING", label: "Preparing", desc: "Your order is being packed" },
  { status: "SHIPPED", label: "Shipped", desc: "On its way to you" },
  { status: "DELIVERED", label: "Delivered", desc: "Order delivered successfully" },
];

const STATUS_ORDER: Record<Status, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

function StatusTimeline({ status }: { status: Status }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/30 dark:bg-red-950/20">
        <XCircle size={20} className="shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
          <p className="text-xs text-red-500 dark:text-red-500/80">
            This order was cancelled. Contact support if you have questions.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER[status];

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-5 top-5 h-[calc(100%-40px)] w-0.5 bg-gray-100 dark:bg-[#2A2A2A]" aria-hidden="true" />

      <div className="space-y-0">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-[#5DC600] bg-[#5DC600]"
                    : active
                    ? "border-[#5DC600] bg-white dark:bg-[#0D0D0D]"
                    : "border-gray-200 bg-white dark:border-[#2A2A2A] dark:bg-[#0D0D0D]"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-black" />
                ) : active ? (
                  <Clock size={18} className="text-[#5DC600]" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-[#4A4A4A]" />
                )}
              </div>

              {/* Text */}
              <div className="pt-1.5">
                <p
                  className={`text-sm font-semibold ${
                    done || active
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-[#4A4A4A]"
                  }`}
                >
                  {step.label}
                  {active && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#EBF5E9] px-2 py-0.5 text-xs font-medium text-[#2E7D00] dark:bg-[#5DC600]/10 dark:text-[#5DC600]">
                      Current
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-[#A3A3A3]">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<
    { success: true; order: TrackedOrder } | { success: false; error: string } | null
  >(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await trackOrder(orderNumber);
      setResult(res);
    });
  }

  const order = result?.success ? result.order : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Order Tracking
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Track your order
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-[#A3A3A3]">
            Enter the order number from your confirmation email.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A3A3A3]"
            />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. GN-20240101-XXXX"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none focus:ring-2 focus:ring-[#5DC600]/20 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#4A4A4A]"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !orderNumber.trim()}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#5DC600] px-6 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600] disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Track
          </button>
        </form>

        {/* Error */}
        {result && !result.success && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/30 dark:bg-red-950/20">
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Order meta */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#A3A3A3]">
                    Order Number
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-[#5DC600]">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#A3A3A3]">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <StatusTimeline status={order.status} />

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="mt-6 flex items-center gap-3 rounded-lg border border-[#5DC600]/30 bg-[#EBF5E9] px-4 py-3 dark:bg-[#5DC600]/10">
                  <Truck size={16} className="shrink-0 text-[#5DC600]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#2E7D00] dark:text-[#5DC600]">
                      Tracking Number
                    </p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-[#2A2A2A]">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Items in this order
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#2A2A2A]">
                        <Package size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.slug ? (
                            <Link
                              href={`/products/${item.slug}`}
                              className="hover:text-[#5DC600]"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            item.productName
                          )}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">
                          {item.variantLabel} &times; {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-2xl border border-gray-100 p-6 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-[#5DC600]" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Delivering to
                </h2>
              </div>
              <p className="text-sm text-gray-700 dark:text-[#A3A3A3]">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>

            {/* Need help */}
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-4 dark:bg-[#1A1A1A]">
              <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                Questions about your order?
              </p>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#5DC600] hover:text-[#4DAF00]"
              >
                Contact support <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!result && (
          <div className="mt-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]">
              <Truck size={28} className="text-gray-300 dark:text-[#2A2A2A]" />
            </div>
            <p className="mt-4 text-sm text-gray-400 dark:text-[#A3A3A3]">
              Your order number is in the confirmation email we sent you.
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-block text-sm text-[#5DC600] hover:text-[#4DAF00]"
            >
              Can&apos;t find your order? Contact us
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
