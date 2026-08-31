import type {
  DealerSubscriptionPaymentRow,
  DealerSubscriptionRow,
} from "@/types/database";
import type {
  DealerSubscriptionPaymentRecord,
  DealerSubscriptionRecord,
  PartnerPlanId,
  SubscriptionStatusUi,
} from "@/types/billing";

export function mapDealerSubscription(
  row: DealerSubscriptionRow
): DealerSubscriptionRecord {
  return {
    id: row.id,
    planId: row.plan as PartnerPlanId,
    status: row.status as SubscriptionStatusUi,
    billingCycle: row.billing_cycle,
    amountPaise: row.amount_paise,
    currency: row.currency,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    razorpayPaymentId: row.razorpay_payment_id,
  };
}

export function mapDealerSubscriptionPayment(
  row: DealerSubscriptionPaymentRow
): DealerSubscriptionPaymentRecord {
  return {
    id: row.id,
    planId: row.plan as PartnerPlanId,
    amountPaise: row.amount_paise,
    currency: row.currency,
    status: row.status,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}
