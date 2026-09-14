import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * PENDING — Razorpay live checkout is not finished until ops does this locally.
 * Keep real keys in `.env` / `.env.local` only. Never commit secrets, test charges, or SQL dumps.
 *
 * [ ] Create a Razorpay account and stay in test mode first
 * [ ] Put `NEXT_PUBLIC_RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in local env (not git)
 * [ ] Put `RAZORPAY_WEBHOOK_SECRET` in local env
 * [ ] Dashboard webhook: `/api/payments/razorpay/webhook` for `payment.captured`
 * [ ] Test-buy pack-10 as `broker@sqftgo.com`, confirm slots increase once
 * [ ] Switch to live keys only after the test payment works
 *
 * Quota, admin grants, and catalog edits work without keys. Checkout returns 503 until keys exist.
 */
export const RAZORPAY_OPS_PENDING = true;

export function getRazorpayKeyId(): string | null {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim();
  return key || null;
}

export function getRazorpayKeySecret(): string | null {
  const key = process.env.RAZORPAY_KEY_SECRET?.trim();
  return key || null;
}

export function getRazorpayWebhookSecret(): string | null {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || null;
}

export function hasRazorpayConfig(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

function basicAuth(): string {
  const id = getRazorpayKeyId();
  const secret = getRazorpayKeySecret();
  if (!id || !secret) throw new Error("Razorpay is not configured");
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
  });
  const data = (await res.json()) as RazorpayOrder & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(data.error?.description ?? "Unable to create Razorpay order");
  }
  return data;
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
