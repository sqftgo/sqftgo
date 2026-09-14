"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PropertyForm, type PropertyFormSubmitData } from "@/features/properties";
import { Alert, Button, EmptyState, Panel } from "@/components/ui";
import { listingPlanApi } from "@/services/listing-plans";
import { BuyListingPlanButton } from "@/features/payments/BuyListingPlanButton";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import type { DealerListingQuotaView, ListingPlan } from "@/types/listing-plan";

export default function AddPropertyPage() {
  const { addProperty, addLog, userEmail } = useApp();
  const [quota, setQuota] = useState<DealerListingQuotaView | null>(null);
  const [plans, setPlans] = useState<ListingPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshQuota = async () => {
    const [nextQuota, nextPlans] = await Promise.all([
      listingPlanApi.getQuota(),
      listingPlanApi.listActive(),
    ]);
    setQuota(nextQuota);
    setPlans(nextPlans);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshQuota();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to check listing slots");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: PropertyFormSubmitData) => {
    try {
      await addProperty({
        title: data.title,
        type: data.type,
        purpose: data.purpose,
        description: data.description,
        city: data.city,
        state: data.state,
        country: data.country,
        locality: data.locality,
        nearbyHospital: data.nearbyHospital,
        nearbySchool: data.nearbySchool,
        nearbyTransportation: data.nearbyTransportation,
        size: data.size,
        bhk: data.bhk,
        bathrooms: data.bathrooms,
        parking: data.parking,
        yearBuilt: data.yearBuilt,
        furnished: data.furnished,
        price: data.price,
        amenities: data.amenities,
        images: data.images,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        reraId: data.reraId,
        reraApproved: data.reraApproved,
        status: data.status,
      });
      addLog({
        action: data.status === "Draft" ? "Property Draft Saved" : "Property Added",
        performedBy: userEmail,
        role: "Dealer",
        target: data.title,
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "LISTING_QUOTA") {
        await refreshQuota().catch(() => undefined);
      }
      throw err;
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-sm font-semibold text-charcoal/50">Checking listing slots…</p>
    );
  }

  if (quota?.atCap && !quota.unlimited) {
    return (
      <div className="max-w-2xl space-y-6">
        <EmptyState
          title="Listing slots used"
          description={`You have used ${quota.used} of ${quota.quota} slots (including ${quota.free} free). Buy a pack to list more properties.`}
        >
          <Link href={ROUTES.dealerSubscription}>
            <Button>View listing packs</Button>
          </Link>
        </EmptyState>
        {plans.length > 0 ? (
          <Panel title="Buy more slots" rounded="3xl" padding="lg">
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-charcoal">{plan.name}</p>
                    <p className="text-xs text-charcoal/50 font-semibold">
                      +{plan.slots} listings · ₹{plan.priceInr}
                    </p>
                  </div>
                  <div className="w-40">
                    <BuyListingPlanButton plan={plan} onPaid={() => void refreshQuota()} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="warning" title="Quota check failed" description={error} /> : null}
      {quota ? (
        <p className="text-xs font-bold text-charcoal/45 uppercase tracking-wider">
          {quota.unlimited
            ? `Slots used: ${quota.used} · unlimited included cap`
            : `Slots left: ${quota.remaining} of ${quota.quota}`}
        </p>
      ) : null}
      <PropertyForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
