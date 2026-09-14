"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { Alert, Badge, DashboardPageHeader, Panel, StatCard, KpiGrid } from "@/components/ui";
import { BuyListingPlanButton } from "@/features/payments/BuyListingPlanButton";
import { listingPlanApi } from "@/services/listing-plans";
import type { DealerListingQuotaView, ListingPlan } from "@/types/listing-plan";

export default function DealerListingPlansPage() {
  const [plans, setPlans] = useState<ListingPlan[]>([]);
  const [quota, setQuota] = useState<DealerListingQuotaView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError(null);
    const [nextPlans, nextQuota] = await Promise.all([
      listingPlanApi.listActive(),
      listingPlanApi.getQuota(),
    ]);
    setPlans(nextPlans);
    setQuota(nextQuota);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load listing plans");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-charcoal">
      <DashboardPageHeader
        title="Listing packs"
        description="3 free property listings. Buy a pack when you need more. New packs can be added by admin without changing checkout. Razorpay keys are still pending — checkout stays off until local env is set."
        className="rounded-3xl"
      />

      {error ? <Alert variant="danger" title="Could not load plans" description={error} /> : null}

      {quota ? (
        <KpiGrid className="sm:grid-cols-4">
          <StatCard label="Used" value={quota.used} icon={<CreditCard className="w-4 h-4 text-indigo" />} />
          <StatCard label="Free included" value={quota.free} />
          <StatCard label="Bought / granted" value={quota.purchased} />
          <StatCard label="Slots left" value={quota.remaining} tone="indigo" />
        </KpiGrid>
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-charcoal/50">Loading plans…</p>
      ) : plans.length === 0 ? (
        <Panel padding="md" rounded="3xl">
          <p className="text-sm font-semibold text-charcoal/60">
            No listing packs are on sale yet. Ask admin to add one.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Panel key={plan.id} padding="lg" rounded="3xl">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-black text-charcoal/40 uppercase tracking-widest">
                    {plan.name}
                  </p>
                  <p className="text-2xl font-serif font-black text-charcoal mt-1">
                    ₹{plan.priceInr}
                  </p>
                </div>
                <Badge tone="primary" size="sm">
                  +{plan.slots} listings
                </Badge>
              </div>
              <p className="text-sm text-charcoal/60 font-medium mb-5">
                {plan.description || `Add ${plan.slots} more property slots.`}
              </p>
              <BuyListingPlanButton plan={plan} onPaid={() => void refresh()} />
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
