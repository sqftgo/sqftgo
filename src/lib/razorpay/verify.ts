import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

function equalHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = createHmac("sha256", params.keySecret)
    .update(body)
    .digest("hex");
  return equalHex(expected, params.signature);
}

export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}): boolean {
  const expected = createHmac("sha256", params.webhookSecret)
    .update(params.rawBody)
    .digest("hex");
  return equalHex(expected, params.signature);
}
