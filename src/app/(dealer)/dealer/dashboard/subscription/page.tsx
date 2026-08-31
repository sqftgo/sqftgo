"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Building2,
  Zap,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  PARTNER_PLANS,
  formatPlanPrice,
  type PartnerPlanId,
} from "@/features/billing/plans";
import { openRazorpayCheckout } from "@/lib/razorpay/checkout";
import { subscriptionService } from "@/services/subscription";
import type { SubscriptionOverview } from "@/types/billing";
import { ApiError } from "@/lib/api/client";
import {
  DashboardPageHeader,
  Alert,
  Badge,
  Button,
  Panel,
  GlobalLoading,
  ErrorState,
} from "@/components/ui";

const PLAN_ICONS = {
  starter: Zap,
  professional: Crown,
  enterprise: Building2,
} as const;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function DealerSubscriptionPage() {
  const { userName, userEmail } = useApp();
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<PartnerPlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getOverview();
      setOverview(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activePlanId = overview?.subscription?.status === "active"
    ? overview.subscription.planId
    : null;

  const statusTone = useMemo(() => {
    const status = overview?.subscription?.status;
    if (status === "active") return "success" as const;
    if (status === "pending") return "warning" as const;
    if (status === "past_due" || status === "expired") return "danger" as const;
    return "neutral" as const;
  }, [overview?.subscription?.status]);

  const handleSubscribe = async (planId: PartnerPlanId) => {
    if (!overview?.billingEnabled) {
      setNotice(
        "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local to enable checkout."
      );
      return;
    }

    setBusyPlan(planId);
    setNotice(null);
    setError(null);

    try {
      const order = await subscriptionService.createOrder(planId);
      if (!order.keyId) {
        throw new Error("Razorpay key missing from server response");
      }

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SqftGo Partner",
        description: `${order.plan.name} partner plan`,
        order_id: order.orderId,
        prefill: {
          name: userName || undefined,
          email: userEmail || undefined,
        },
        notes: {
          plan_id: planId,
        },
        theme: { color: "#2F3A5F" },
        handler: async (response) => {
          try {
            await subscriptionService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setNotice("Payment verified — your plan is active.");
            await load();
          } catch (verifyErr) {
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment received but verification failed. Refresh in a moment."
            );
          } finally {
            setBusyPlan(null);
          }
        },
        modal: {
          ondismiss: () => setBusyPlan(null),
        },
      });
    } catch (err) {
      setBusyPlan(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not start checkout"
      );
    }
  };

  if (loading) return <GlobalLoading label="Loading plans…" />;
  if (error && !overview) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-charcoal">
      <DashboardPageHeader
        title="Partner plans"
        description="Choose a monthly plan. Payments run through Razorpay Checkout with server-side signature verification."
        className="rounded-3xl"
      />

      {overview?.subscription && overview.subscription.status !== "inactive" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        >
          <Panel padding="lg" rounded="3xl" className="border-indigo/15 bg-white/90">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo/10 text-indigo">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-black tracking-wide text-charcoal">
                      Current plan
                    </p>
                    <Badge tone={statusTone} size="sm">
                      {overview.subscription.status}
                    </Badge>
                  </div>
                  <p className="font-serif text-2xl font-black capitalize text-indigo">
                    {overview.subscription.planId}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-charcoal/55">
                    Renews / ends {formatDate(overview.subscription.currentPeriodEnd)}
                    {" · "}
                    {formatPlanPrice(overview.subscription.amountPaise)}
                    /month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal/40">
                <CreditCard className="h-4 w-4" />
                Billed via Razorpay
              </div>
            </div>
          </Panel>
        </motion.div>
      )}

      {!overview?.billingEnabled && (
        <Alert
          variant="warning"
          title="Checkout keys not set"
          description="UI is live. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and optionally RAZORPAY_WEBHOOK_SECRET to .env.local, then restart the server."
        />
      )}

      {notice && (
        <Alert variant="success" title="All set" description={notice} />
      )}
      {error && overview && (
        <Alert variant="danger" title="Something went wrong" description={error} />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PARTNER_PLANS.map((plan, index) => {
          const Icon = PLAN_ICONS[plan.id];
          const isCurrent = activePlanId === plan.id;
          const isBusy = busyPlan === plan.id;

          return (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.2, 0, 0, 1],
              }}
              className={`relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-18px_rgba(47,58,95,0.35)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(15,23,42,0.04),0_20px_40px_-18px_rgba(47,58,95,0.4)] ${
                plan.highlighted
                  ? "border-indigo ring-1 ring-indigo/20"
                  : "border-indigo/10"
              }`}
            >
              {plan.badge && (
                <div className="absolute right-4 top-4">
                  <Badge
                    tone={plan.highlighted ? "primary" : "neutral"}
                    size="sm"
                    className={
                      plan.highlighted
                        ? "bg-indigo text-white border-indigo"
                        : undefined
                    }
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    plan.highlighted
                      ? "bg-indigo text-white"
                      : "bg-indigo/8 text-indigo"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-charcoal/40">
                    {plan.name}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/55">
                    {plan.tagline}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="font-serif text-4xl font-black tracking-tight text-charcoal tabular-nums">
                  {formatPlanPrice(plan.amountPaise)}
                  <span className="ml-1 text-sm font-semibold text-charcoal/40">
                    {plan.periodLabel}
                  </span>
                </p>
                <p className="mt-2 text-xs font-semibold text-charcoal/45">
                  {plan.listingLimit == null
                    ? "Unlimited active listings"
                    : `Up to ${plan.listingLimit} active listings`}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-charcoal/70">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                fullWidth
                size="md"
                variant={plan.highlighted ? "primary" : "outline"}
                disabled={isCurrent || isBusy || Boolean(busyPlan)}
                onClick={() => void handleSubscribe(plan.id)}
                className="active:scale-[0.96]"
              >
                {isCurrent
                  ? "Current plan"
                  : isBusy
                    ? "Opening checkout…"
                    : overview?.billingEnabled
                      ? `Upgrade to ${plan.name}`
                      : "Configure Razorpay to pay"}
              </Button>
            </motion.article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="How billing works" padding="md" rounded="3xl">
          <ol className="space-y-3 text-xs font-semibold leading-relaxed text-charcoal/65">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-black text-indigo">
                1
              </span>
              Server creates a Razorpay order for the selected plan amount.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-black text-indigo">
                2
              </span>
              Checkout opens in-browser; card / UPI / netbanking handled by Razorpay.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-black text-indigo">
                3
              </span>
              We verify the HMAC signature, then activate your partner period (30 days).
            </li>
          </ol>
        </Panel>

        <Panel title="Recent payments" padding="md" rounded="3xl">
          {overview?.recentPayments?.length ? (
            <ul className="space-y-3">
              {overview.recentPayments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-indigo/5 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-black capitalize text-charcoal">
                      {p.planId}
                    </p>
                    <p className="text-[11px] font-semibold text-charcoal/45">
                      {formatDate(p.paidAt ?? p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black tabular-nums text-charcoal">
                      {formatPlanPrice(p.amountPaise)}
                    </p>
                    <Badge
                      size="sm"
                      tone={
                        p.status === "paid"
                          ? "success"
                          : p.status === "failed"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-start gap-2 text-xs font-semibold text-charcoal/50">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 text-indigo/50" />
              No payments yet. Pick a plan above when Razorpay keys are ready.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
