"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { listingPlanApi } from "@/services/listing-plans";
import { openRazorpayCheckout } from "@/lib/razorpay/checkout";
import type { ListingPlan } from "@/types/listing-plan";

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
      const keyId = order.keyId;
      if (!keyId) {
        throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID on the server.");
      }

      await new Promise<void>((resolve, reject) => {
        void openRazorpayCheckout({
          key: keyId,
          amount: order.amountPaise,
          currency: order.currency,
          name: "SqftGo",
          description: `${plan.name} · +${plan.slots} listings`,
          order_id: order.razorpayOrderId,
          prefill: order.prefill,
          theme: { color: "#2F3A5F" },
          handler: async (response) => {
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
        }).catch(reject);
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
