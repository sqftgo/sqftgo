export type PartnerPlanId = "starter" | "professional" | "enterprise";

export type SubscriptionStatusUi =
  | "inactive"
  | "pending"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type DealerSubscriptionRecord = {
  id: string;
  planId: PartnerPlanId;
  status: SubscriptionStatusUi;
  billingCycle: string;
  amountPaise: number;
  currency: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  razorpayPaymentId: string | null;
};

export type DealerSubscriptionPaymentRecord = {
  id: string;
  planId: PartnerPlanId;
  amountPaise: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type SubscriptionOverview = {
  billingEnabled: boolean;
  razorpayKeyId: string | null;
  subscription: DealerSubscriptionRecord | null;
  recentPayments: DealerSubscriptionPaymentRecord[];
};
