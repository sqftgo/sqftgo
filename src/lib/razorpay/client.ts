import "server-only";

import { getRazorpayConfig } from "./config";

type RazorpayOrder = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  notes?: Record<string, string>;
  created_at: number;
};

function authHeader(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const config = getRazorpayConfig();
  if (!config) throw new Error("Razorpay is not configured");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(config.keyId, config.keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: input.currency ?? "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes ?? {},
    }),
  });

  const data = (await res.json().catch(() => ({}))) as RazorpayOrder & {
    error?: { description?: string; code?: string };
  };

  if (!res.ok) {
    throw new Error(
      data.error?.description ?? `Razorpay order failed (${res.status})`
    );
  }

  return data;
}

export async function fetchRazorpayPayment(paymentId: string): Promise<{
  id: string;
  status: string;
  order_id: string;
  amount: number;
  currency: string;
} | null> {
  const config = getRazorpayConfig();
  if (!config) return null;

  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: authHeader(config.keyId, config.keySecret),
    },
  });

  if (!res.ok) return null;
  return (await res.json()) as {
    id: string;
    status: string;
    order_id: string;
    amount: number;
    currency: string;
  };
}
