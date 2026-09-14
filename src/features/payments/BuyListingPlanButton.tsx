"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { listingPlanApi } from "@/services/listing-plans";
import type { ListingPlan } from "@/types/listing-plan";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-razorpay-checkout]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(script);
  });
}

type Props = {
  plan: ListingPlan;
  onPaid: () => void;
};

export function BuyListingPlanButton({ plan, onPaid }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    setError(null);
    setBusy(true);
    try {
      const order = await listingPlanApi.createOrder(plan.id);
      if (!order.keyId) {
        throw new Error("Razorpay public key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      }
      await loadCheckoutScript();
      if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable");

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.keyId,
          amount: order.amountPaise,
          currency: order.currency,
          name: "SqftGo",
          description: `${plan.name} · +${plan.slots} listings`,
          order_id: order.razorpayOrderId,
          prefill: order.prefill,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await listingPlanApi.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });
        checkout.open();
      });
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" fullWidth onClick={() => void buy()} disabled={busy}>
        {busy ? "Opening Razorpay…" : `Pay ₹${plan.priceInr}`}
      </Button>
      {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
