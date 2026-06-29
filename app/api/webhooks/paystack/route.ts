import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const reference: string = event.data.reference;

    // Guard against double-processing (webhook + verify page race)
    const order = await db.order.findUnique({
      where: { paystackRef: reference },
      select: { id: true, paymentStatus: true, couponId: true },
    });

    if (order && order.paymentStatus !== "PAID") {
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
      revalidatePath("/account/orders");
    }
  }

  return NextResponse.json({ received: true });
}
