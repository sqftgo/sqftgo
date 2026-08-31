import { apiClient } from "@/lib/api/client";
import type { PartnerPlanId } from "@/features/billing/plans";
import type {
  DealerSubscriptionRecord,
  SubscriptionOverview,
} from "@/types/billing";

export type CreateSubscriptionOrderResult = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  paymentRecordId: string;
  plan: {
    id: PartnerPlanId;
    name: string;
    amountPaise: number;
  };
};

export type VerifySubscriptionResult = {
  alreadyProcessed: boolean;
  subscription: DealerSubscriptionRecord | null;
};

export const subscriptionService = {
  getOverview() {
    return apiClient<SubscriptionOverview>("/api/dealer/subscription");
  },

  createOrder(planId: PartnerPlanId) {
    return apiClient<CreateSubscriptionOrderResult>(
      "/api/dealer/subscription/order",
      {
        method: "POST",
        body: JSON.stringify({ planId }),
      }
    );
  },

  verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return apiClient<VerifySubscriptionResult>(
      "/api/dealer/subscription/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
