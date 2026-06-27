import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const reference: string = event.data.reference;

    await db.order.updateMany({
      where: { paystackRef: reference },
      data: { paymentStatus: "PAID", status: "PROCESSING" },
    });
  }

  return NextResponse.json({ received: true });
}
