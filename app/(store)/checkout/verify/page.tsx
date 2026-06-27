import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL } from "@/lib/paystack";
import { sendOrderEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  return res.json();
}

export default async function CheckoutVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference, trxref } = await searchParams;
  const ref = (reference ?? trxref ?? "").trim();

  if (!ref) redirect("/checkout");

  // Verify payment with Paystack API
  const paystackData = await verifyPaystackTransaction(ref);
  const paymentSuccess =
    paystackData.status === true && paystackData.data?.status === "success";

  if (!paymentSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <XCircle size={40} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Payment not completed
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-[#A3A3A3]">
            Your payment was cancelled or unsuccessful. Your order has not been placed &mdash; your
            cart is safe.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="flex items-center justify-center rounded-xl bg-[#5DC600] px-6 py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            Try Again
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A] dark:hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Find the order by Paystack reference — fetch full data for emails
  const order = await db.order.findUnique({
    where: { paystackRef: ref },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      couponId: true,
      subtotal: true,
      discountAmount: true,
      shippingAmount: true,
      total: true,
      shippingAddress: true,
      guestEmail: true,
      userId: true,
      items: {
        select: {
          productName: true,
          variantLabel: true,
          quantity: true,
          price: true,
        },
      },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) redirect("/");

  const wasAlreadyPaid = order.paymentStatus === "PAID";

  // Mark PAID and increment coupon — only if not already done by webhook
  if (!wasAlreadyPaid) {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "PROCESSING" },
      });
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });

    // Send confirmation emails (fire-and-forget — never block the redirect)
    const addr = order.shippingAddress as Record<string, string>;
    const customerEmail = order.user?.email ?? order.guestEmail ?? addr.email ?? "";
    const customerName = order.user?.name ?? addr.fullName ?? "Customer";

    if (customerEmail) {
      sendOrderEmails({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail,
        customerName,
        items: order.items.map((i) => ({
          productName: i.productName,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          price: parseFloat(i.price.toString()),
        })),
        subtotal: parseFloat(order.subtotal.toString()),
        discountAmount: parseFloat(order.discountAmount.toString()),
        shippingAmount: parseFloat(order.shippingAmount.toString()),
        total: parseFloat(order.total.toString()),
        shippingAddress: {
          fullName: addr.fullName,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          phone: addr.phone,
        },
        orderUrl: "",
      }).catch(() => {
        // Email failures must not break the order flow
      });
    }
  }

  // Clear the cart from DB
  const jar = await cookies();
  const sessionId = jar.get("gn_cart_session")?.value;
  if (sessionId) {
    await db.cartItem.deleteMany({ where: { sessionId } });
  }

  redirect(`/checkout/success?order=${order.orderNumber}`);
}
