"use client";

import { useEffect, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import {
  DashboardPageHeader,
  Alert,
  Badge,
  Button,
  FormField,
  Panel,
  TextInput,
  AdminCard,
} from "@/components/ui";
import { servicePlatformService } from "@/services";
import type {
  ServiceWebsitePromotion,
  ServiceWebsitePromotionPayment,
  ServiceWebsitePromotionPlan,
} from "@/types";

type PlanDraft = {
  slug: string;
  name: string;
  description: string;
  priceInr: number;
  billingType: "one_time" | "recurring";
  durationDays: number;
};

const emptyPlan: PlanDraft = {
  slug: "",
  name: "",
  description: "",
  priceInr: 499,
  billingType: "one_time",
  durationDays: 30,
};

export default function AdminWebsitePromotionPage() {
  const [plans, setPlans] = useState<ServiceWebsitePromotionPlan[]>([]);
  const [items, setItems] = useState<
    Array<ServiceWebsitePromotion & { firmName?: string | null }>
  >([]);
  const [payments, setPayments] = useState<ServiceWebsitePromotionPayment[]>([]);
  const [draft, setDraft] = useState(emptyPlan);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const [planRes, promoRes] = await Promise.all([
      servicePlatformService.adminListWebsitePlans(),
      servicePlatformService.adminListWebsitePromotions(),
    ]);
    setPlans(planRes.items);
    setItems(promoRes.items);
    setPayments(promoRes.payments);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        handleClientError(err, { fallback: "Unable to load" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createPlan = async () => {
    setSaving(true);
    setError(null);
    try {
      await servicePlatformService.adminCreateWebsitePlan({
        ...draft,
        isActive: true,
        sortOrder: (plans[plans.length - 1]?.sortOrder ?? 0) + 10,
      });
      setDraft(emptyPlan);
      setNotice("Plan created.");
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to create plan" });
    } finally {
      setSaving(false);
    }
  };

  const togglePlan = async (plan: ServiceWebsitePromotionPlan) => {
    setError(null);
    try {
      await servicePlatformService.adminPatchWebsitePlan(plan.id, {
        isActive: !plan.isActive,
      });
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update plan" });
    }
  };

  const extendPromo = async (id: string, days: number) => {
    setError(null);
    try {
      await servicePlatformService.adminPatchWebsitePromotion(id, { extendDays: days });
      setNotice(`Extended by ${days} days.`);
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to extend" });
    }
  };

  const setStatus = async (
    id: string,
    status: ServiceWebsitePromotion["status"]
  ) => {
    setError(null);
    try {
      await servicePlatformService.adminPatchWebsitePromotion(id, { status });
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update status" });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Website promotion"
        description="Configure premium website-link pricing and manage service-provider entitlements."
      />

      {error ? <Alert variant="danger" title="Error" description={error} /> : null}
      {notice ? <Alert variant="success" title="Done" description={notice} /> : null}
      {loading ? (
        <p className="text-sm font-semibold text-charcoal/50">Loading…</p>
      ) : (
        <>
          <Panel padding="lg" rounded="3xl" className="space-y-4">
            <h2 className="font-serif font-black text-lg text-indigo">Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p) => (
                <AdminCard
                  key={p.id}
                  accent={p.isActive ? "emerald" : "indigo"}
                  footer={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => void togglePlan(p)}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base font-black text-charcoal">{p.name}</h3>
                      <p className="text-[11px] font-semibold text-charcoal/45 mt-0.5">{p.slug}</p>
                    </div>
                    <Badge tone={p.isActive ? "success" : "neutral"}>
                      {p.isActive ? "active" : "off"}
                    </Badge>
                  </div>
                  <p className="font-serif text-2xl font-black text-indigo">
                    ₹{(p.pricePaise / 100).toFixed(0)}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/55">
                    {p.durationDays} days · {p.billingType}
                  </p>
                </AdminCard>
              ))}
            </div>

            <div className="pt-4 border-t border-sand grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Slug">
                <TextInput
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                  placeholder="website-promo-60"
                />
              </FormField>
              <FormField label="Name">
                <TextInput
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Price (INR)">
                <TextInput
                  type="number"
                  value={String(draft.priceInr)}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, priceInr: Number(e.target.value) || 0 }))
                  }
                />
              </FormField>
              <FormField label="Duration (days)">
                <TextInput
                  type="number"
                  value={String(draft.durationDays)}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, durationDays: Number(e.target.value) || 1 }))
                  }
                />
              </FormField>
              <FormField label="Billing type">
                <select
                  className="w-full rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm font-semibold"
                  value={draft.billingType}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      billingType: e.target.value as "one_time" | "recurring",
                    }))
                  }
                >
                  <option value="one_time">One-time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </FormField>
              <FormField label="Description">
                <TextInput
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </FormField>
            </div>
            <Button type="button" loading={saving} onClick={() => void createPlan()}>
              Create plan
            </Button>
          </Panel>

          <Panel padding="lg" rounded="3xl" className="space-y-4">
            <h2 className="font-serif font-black text-lg text-indigo">Provider entitlements</h2>
            {items.length === 0 ? (
              <p className="text-sm font-semibold text-charcoal/50">No promotions yet.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((item) => (
                  <AdminCard
                    key={item.id}
                    accent={
                      item.isActive ? "emerald" : item.status === "expired" ? "gold" : "indigo"
                    }
                    footer={
                      <div className="flex w-full flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void extendPromo(item.id, 30)}
                        >
                          +30 days
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void setStatus(item.id, "active")}
                        >
                          Activate
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void setStatus(item.id, "cancelled")}
                        >
                          Deactivate
                        </Button>
                      </div>
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-base font-black text-charcoal">
                        {item.firmName || item.directoryProfileId}
                      </h3>
                      <Badge
                        tone={
                          item.isActive
                            ? "success"
                            : item.status === "expired"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-charcoal/55">
                      {item.websiteUrl || "No website URL"}
                    </p>
                    <p className="text-[11px] font-semibold text-charcoal/40">
                      Expires{" "}
                      {item.expiresAt
                        ? new Date(item.expiresAt).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </AdminCard>
                ))}
              </div>
            )}
          </Panel>

          <Panel padding="lg" rounded="3xl" className="space-y-3">
            <h2 className="font-serif font-black text-lg text-indigo">Recent payments</h2>
            {payments.length === 0 ? (
              <p className="text-sm font-semibold text-charcoal/50">No payments yet.</p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="text-xs font-semibold text-charcoal/70 flex justify-between gap-3 border-b border-sand pb-2"
                  >
                    <span>
                      {p.status} · {p.razorpayOrderId || p.id.slice(0, 8)}
                    </span>
                    <span>₹{(p.amountPaise / 100).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
