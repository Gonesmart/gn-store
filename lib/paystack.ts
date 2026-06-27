import crypto from "crypto";

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;
export const PAYSTACK_BASE_URL = "https://api.paystack.co";

export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export function formatPaystackAmount(amountInNaira: number): number {
  return Math.round(amountInNaira * 100); // Paystack uses kobo (smallest unit)
}

export function parsePaystackAmount(amountInKobo: number): number {
  return amountInKobo / 100;
}
