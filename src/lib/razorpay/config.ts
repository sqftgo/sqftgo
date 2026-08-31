import "server-only";

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string | null;
};

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  if (!keyId || !keySecret) return null;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || null;
  return { keyId, keySecret, webhookSecret };
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayConfig() !== null;
}

export function getRazorpayKeyIdPublic(): string | null {
  return getRazorpayConfig()?.keyId ?? null;
}
