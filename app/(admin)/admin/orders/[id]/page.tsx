import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, MapPin, CreditCard, Tag, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/order-status-badge";
import { OrderActionsPanel } from "@/components/admin/order-actions-panel";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { orderNumber: true } });
  return { title: order ? `Order ${order.orderNumber}` : "Order Not Found" };
}

function formatCurrency(amount: { toNumber(): number } | number): string {
  const n = typeof amount === "number" ? amount : amount.toNumber();
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: { take: 1, orderBy: { position: "asc" } },
            },
          },
        },
      },
      coupon: { select: { code: true, type: true, value: true } },
    },
  });

  if (!order) notFound();

  const shippingAddress = order.shippingAddress as {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
  };

  const customer = order.user
    ? { name: order.user.name, email: order.user.email, id: order.user.id }
    : { name: "Guest", email: order.guestEmail ?? "—", id: null };

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#A3A3A3] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <p className="mt-1 text-sm text-[#A3A3A3]">{formatDate(order.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Order items */}
          <div
            className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center gap-2 border-b border-[#2A2A2A] px-5 py-4">
              <Package className="h-4 w-4 text-[#5DC600]" />
              <h2 className="text-sm font-semibold text-white">
                Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {order.items.map((item) => {
                const thumb = item.product.images[0]?.url;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#0D0D0D]">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#4A4A4A]">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.productName}</p>
                      <p className="text-xs text-[#A3A3A3]">{item.variantLabel}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-white">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-[#A3A3A3]">× {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(item.price.toNumber() * item.quantity)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/products`}
                      className="shrink-0 text-[#A3A3A3] transition-colors hover:text-white"
                      title="View product"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div
            className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-[#5DC600]" />
              <h2 className="text-sm font-semibold text-white">Payment summary</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount.toNumber() > 0 && (
                <div className="flex justify-between text-[#A3A3A3]">
                  <span className="flex items-center gap-1.5">
                    Discount
                    {order.coupon && (
                      <span className="inline-flex items-center gap-1 rounded border border-[#5DC600]/30 bg-[#5DC600]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#5DC600]">
                        <Tag className="h-2.5 w-2.5" />
                        {order.coupon.code}
                      </span>
                    )}
                  </span>
                  <span className="text-[#5DC600]">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.shippingAmount.toNumber() > 0 && (
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Shipping</span>
                  <span className="text-white">{formatCurrency(order.shippingAmount)}</span>
                </div>
              )}
              {order.taxAmount.toNumber() > 0 && (
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Tax</span>
                  <span className="text-white">{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-[#2A2A2A] pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white text-base">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
            {order.paystackRef && (
              <p className="mt-3 text-xs text-[#A3A3A3]">
                Paystack ref:{" "}
                <span className="font-mono text-[#5DC600]">{order.paystackRef}</span>
              </p>
            )}
            {order.trackingNumber && (
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Tracking:{" "}
                <span className="font-mono text-white">{order.trackingNumber}</span>
              </p>
            )}
          </div>

          {/* Shipping address */}
          <div
            className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#5DC600]" />
              <h2 className="text-sm font-semibold text-white">Shipping address</h2>
            </div>
            <address className="not-italic space-y-0.5 text-sm text-[#A3A3A3]">
              {shippingAddress.fullName && (
                <p className="font-medium text-white">{shippingAddress.fullName}</p>
              )}
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
              {shippingAddress.addressLine1 && <p>{shippingAddress.addressLine1}</p>}
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              {(shippingAddress.city || shippingAddress.state) && (
                <p>
                  {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ")}
                </p>
              )}
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
            </address>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Customer */}
          <div
            className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <h2 className="mb-3 text-sm font-semibold text-white">Customer</h2>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5DC600]/15 text-sm font-semibold text-[#5DC600]">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{customer.name}</p>
                <p className="truncate text-xs text-[#A3A3A3]">{customer.email}</p>
                {customer.id && (
                  <Link
                    href={`/admin/customers`}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#5DC600] hover:underline"
                  >
                    View customer <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                )}
                {!customer.id && (
                  <span className="mt-1 inline-block text-xs text-[#4A4A4A]">Guest order</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <h2 className="mb-4 text-sm font-semibold text-white">Manage order</h2>
            <OrderActionsPanel
              orderId={order.id}
              currentStatus={order.status}
              currentTracking={order.trackingNumber}
              currentNotes={order.notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
