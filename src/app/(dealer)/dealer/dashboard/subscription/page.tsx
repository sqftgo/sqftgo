"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ListChecks,
  PackagePlus,
  IndianRupee,
  CalendarCheck,
  BadgeCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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
import { BuyListingPlanButton } from "@/features/payments/BuyListingPlanButton";
import { listingPlanApi } from "@/services/listing-plans";
import type { DealerListingQuotaView, ListingPlan } from "@/types/listing-plan";
import { ApiError } from "@/lib/api/client";
import {
  DashboardPageHeader,
  Alert,
  Badge,
  Button,
  Panel,
  GlobalLoading,
  ErrorState,
  StatCard,
  KpiGrid,
} from "@/components/ui";

const PLAN_ICONS = {
  starter: Zap,
} as const;

const FAQS = [
  {
    q: "Is this a monthly subscription or one-time payment?",
    a: "It's a monthly subscription at ₹99/month. Your plan auto-renews every 30 days. You can cancel anytime before renewal.",
  },
  {
    q: "What happens when I subscribe?",
    a: "You get immediate access to all features — unlimited active listings, verified badges, analytics, and priority support. Activation is instant after payment verification.",
  },
  {
    q: "How does payment work?",
    a: "We use Razorpay as our payment gateway. You can pay via UPI, credit/debit card, or net banking. All transactions are encrypted and PCI-DSS compliant.",
  },
  {
    q: "Can I get extra listing packs?",
    a: "Yes. Beyond the base plan your admin may offer one-time listing packs that add extra slots on top of your active subscription.",
  },
  {
    q: "How do I cancel?",
    a: "Contact our support team at support@sqftgo.com before your next billing date. We'll cancel the renewal and your plan stays active until the period ends.",
  },
];

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
  const [packs, setPacks] = useState<ListingPlan[]>([]);
  const [quota, setQuota] = useState<DealerListingQuotaView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<PartnerPlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, nextPacks, nextQuota] = await Promise.all([
        subscriptionService.getOverview(),
        listingPlanApi.listActive().catch(() => [] as ListingPlan[]),
        listingPlanApi.getQuota().catch(() => null),
      ]);
      setOverview(data);
      setPacks(nextPacks);
      setQuota(nextQuota);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

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
      setNotice("Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local to enable checkout.");
      return;
    }
    setBusyPlan(planId);
    setNotice(null);
    setError(null);
    try {
      const order = await subscriptionService.createOrder(planId);
      if (!order.keyId) throw new Error("Razorpay key missing from server response");
      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SqftGo Partner",
        description: `${order.plan.name} — ₹99/month`,
        order_id: order.orderId,
        prefill: { name: userName || undefined, email: userEmail || undefined },
        notes: { plan_id: planId },
        theme: { color: "#2F3A5F" },
        handler: async (response) => {
          try {
            await subscriptionService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setNotice("Payment verified — your plan is now active!");
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
        modal: { ondismiss: () => setBusyPlan(null) },
      });
    } catch (err) {
      setBusyPlan(null);
      setError(
        err instanceof ApiError ? err.message
          : err instanceof Error ? err.message
          : "Could not start checkout"
      );
    }
  };

  if (loading) return <GlobalLoading label="Loading subscription…" />;
  if (error && !overview) return <ErrorState message={error} onRetry={() => void load()} />;

  const plan = PARTNER_PLANS[0];
  const Icon = (plan.id in PLAN_ICONS ? PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] : Zap) ?? Zap;
  const isCurrent = activePlanId === plan.id;
  const isBusy = busyPlan === plan.id;

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-charcoal">
      <DashboardPageHeader
        title="Plans & Billing"
        description="One simple plan. Everything included. Cancel anytime."
        className="rounded-3xl"
      />

      {/* ── Quota Stats (if subscribed) ── */}
      {quota ? (
        <KpiGrid className="sm:grid-cols-4">
          <StatCard label="Listings Used" value={quota.used} icon={<ListChecks className="w-4 h-4 text-indigo" />} />
          <StatCard label="Included Cap" value={quota.unlimited ? "Unlimited" : quota.quota} />
          <StatCard label="Bought Packs" value={quota.purchased} icon={<PackagePlus className="w-4 h-4 text-indigo" />} />
          <StatCard label="Slots Left" value={quota.unlimited ? "∞" : quota.remaining} tone="indigo" />
        </KpiGrid>
      ) : null}

      {/* ── Active Subscription Banner ── */}
      {overview?.subscription && overview.subscription.status !== "inactive" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Panel padding="lg" rounded="3xl" className="border-emerald-200 bg-emerald-50/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-black text-charcoal">Active Subscription</p>
                    <Badge tone={statusTone} size="sm">{overview.subscription.status}</Badge>
                  </div>
                  <p className="font-serif text-xl font-black capitalize text-indigo">
                    SqftGo Starter · ₹99 / month
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-charcoal/55">
                    Renews {formatDate(overview.subscription.currentPeriodEnd)}
                    {" · "}
                    {formatPlanPrice(overview.subscription.amountPaise)}/month
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

      {/* ── Alerts ── */}
      {!overview?.billingEnabled && (
        <Alert
          variant="warning"
          title="Checkout keys not configured"
          description="Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and optionally RAZORPAY_WEBHOOK_SECRET to .env.local, then restart the server."
        />
      )}
      {notice && <Alert variant="success" title="All set!" description={notice} />}
      {error && overview && <Alert variant="danger" title="Something went wrong" description={error} />}

      {/* ── Main Plan Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        className="relative overflow-hidden rounded-[2rem] border-2 border-indigo bg-white shadow-[0_4px_60px_-12px_rgba(47,58,95,0.25)] ring-4 ring-indigo/8"
      >
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(47,58,95,0.05)_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-8 md:p-10">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo text-white shadow-md shadow-indigo/30">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-0.5">SqftGo Partner</p>
                <h2 className="font-serif text-2xl font-black text-indigo leading-none">{plan.name} Plan</h2>
                <p className="text-sm text-charcoal/55 font-medium mt-1">{plan.tagline}</p>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              {plan.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: price + CTA */}
            <div className="flex flex-col gap-6">
              {/* Price */}
              <div className="flex flex-col gap-1">
                <div className="flex items-end gap-2">
                  <span className="font-serif text-6xl font-black tracking-tight text-indigo leading-none tabular-nums">
                    ₹99
                  </span>
                  <span className="text-base font-semibold text-charcoal/45 pb-1">/month</span>
                </div>
                <p className="text-xs font-semibold text-charcoal/45">
                  Billed monthly · Cancel anytime · No setup fee
                </p>
              </div>

              {/* Value chips */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: IndianRupee, label: "₹99 flat", sub: "No hidden charges" },
                  { icon: CalendarCheck, label: "30-day cycle", sub: "Auto-renews monthly" },
                  { icon: BadgeCheck, label: "RERA verified", sub: "Trusted platform" },
                  { icon: Sparkles, label: "Instant access", sub: "Active after payment" },
                ].map(({ icon: ChipIcon, label, sub }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo/4 border border-indigo/10">
                    <ChipIcon className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black text-indigo">{label}</p>
                      <p className="text-[10px] text-charcoal/50 font-medium">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                fullWidth
                size="lg"
                variant="primary"
                disabled={isCurrent || isBusy || Boolean(busyPlan)}
                onClick={() => void handleSubscribe(plan.id)}
                className="active:scale-[0.97] shadow-lg shadow-indigo/25 text-base font-black py-4"
              >
                {isCurrent
                  ? "✓ Current Active Plan"
                  : isBusy
                    ? "Opening checkout…"
                    : overview?.billingEnabled
                      ? "Subscribe · ₹99 / month"
                      : "Configure Razorpay to pay"}
              </Button>

              {isCurrent && (
                <p className="text-xs text-center text-emerald-600 font-semibold -mt-2">
                  ✓ Your subscription is active and all features are unlocked.
                </p>
              )}
            </div>

            {/* Right: features */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/35 mb-1">
                Everything included
              </p>
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-200/60">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span className="text-sm font-semibold text-charcoal/75">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-4 rounded-2xl bg-terracotta/5 border border-terracotta/15 text-xs text-charcoal/65 font-semibold leading-relaxed">
                <strong className="text-terracotta font-black">No risk.</strong> Cancel before your next billing date and you won't be charged again. Your listings stay live until the period ends.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Extra listing packs ── */}
      {packs.length > 0 && (
        <Panel title="Extra Listing Packs" padding="lg" rounded="3xl">
          <p className="mb-4 text-sm font-medium text-charcoal/60">
            One-time add-ons — buy extra listing slots on top of your subscription.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {packs.map((pack) => (
              <div key={pack.id} className="flex items-center justify-between gap-4 rounded-2xl border border-indigo/10 bg-indigo/3 p-4">
                <div>
                  <p className="text-sm font-bold text-charcoal">{pack.name}</p>
                  <p className="text-xs font-semibold text-charcoal/50 mt-0.5">
                    +{pack.slots} listing slots · ₹{pack.priceInr} one-time
                  </p>
                </div>
                <div className="w-36">
                  <BuyListingPlanButton plan={pack} onPaid={() => void load()} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* ── Bottom row: How billing works + Recent payments ── */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="How billing works" padding="md" rounded="3xl">
          <ol className="space-y-4 text-xs font-semibold leading-relaxed text-charcoal/65">
            {[
              "You click Subscribe — our server creates a secure Razorpay order for ₹99.",
              "The Razorpay checkout opens in-browser. Pay via UPI, card, or net banking.",
              "We verify the payment signature server-side and activate your plan instantly (30 days).",
              "You receive a confirmation email. Your listings go live immediately.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-black text-indigo">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
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
                      SqftGo {p.planId}
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
                      tone={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "neutral"}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-start gap-2 text-xs font-semibold text-charcoal/50 py-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 text-indigo/50" />
              No payments yet. Subscribe above to get started.
            </div>
          )}
        </Panel>
      </div>

      {/* ── FAQ ── */}
      <Panel title="Frequently Asked Questions" padding="md" rounded="3xl">
        <div className="divide-y divide-sand/60">
          {FAQS.map((faq, i) => (
            <div key={i} className="py-4 first:pt-1">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2.5 text-sm font-bold text-charcoal group-hover:text-indigo transition-colors">
                  <HelpCircle className="w-4 h-4 text-indigo/50 shrink-0" />
                  {faq.q}
                </span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-charcoal/40 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-charcoal/40 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 ml-6 text-xs font-semibold text-charcoal/60 leading-relaxed"
                >
                  {faq.a}
                </motion.p>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
