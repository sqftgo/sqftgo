"use client";

import { useEffect, useState } from "react";
import { DashboardPageHeader, Alert, Badge, Button, FormField, Panel, TextInput } from "@/components/ui";
import { listingPlanApi } from "@/services/listing-plans";
import type { ListingPlan } from "@/types/listing-plan";

const emptyDraft = {
  slug: "",
  name: "",
  description: "",
  priceInr: 99,
  slots: 10,
};

type PlanDraft = {
  name: string;
  description: string;
  priceInr: number;
  slots: number;
};

export default function AdminListingPlansPage() {
  const [plans, setPlans] = useState<ListingPlan[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PlanDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setPlans(await listingPlanApi.adminList());
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load plans");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createPlan = async () => {
    setError(null);
    setSaving(true);
    try {
      await listingPlanApi.adminCreate({
        slug: draft.slug,
        name: draft.name,
        description: draft.description,
        priceInr: draft.priceInr,
        slots: draft.slots,
        isActive: true,
        sortOrder: (plans[plans.length - 1]?.sortOrder ?? 0) + 10,
      });
      setDraft(emptyDraft);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create plan");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: ListingPlan) => {
    setError(null);
    try {
      await listingPlanApi.adminPatch(plan.id, { isActive: !plan.isActive });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update plan");
    }
  };

  const startEdit = (plan: ListingPlan) => {
    setEditingId(plan.id);
    setEditDraft({
      name: plan.name,
      description: plan.description,
      priceInr: plan.priceInr,
      slots: plan.slots,
    });
  };

  const saveEdit = async (planId: string) => {
    if (!editDraft) return;
    setError(null);
    setSaving(true);
    try {
      await listingPlanApi.adminPatch(planId, {
        name: editDraft.name,
        description: editDraft.description,
        priceInr: editDraft.priceInr,
        slots: editDraft.slots,
      });
      setEditingId(null);
      setEditDraft(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <DashboardPageHeader
        title="Listing packs"
        description="Dealers get free listings from Settings. Add another pack anytime — checkout and the app read this catalog, so you do not change payment code."
      />

      {error ? <Alert variant="danger" title="Listing packs" description={error} /> : null}

      <Panel title="Add a pack" rounded="3xl" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Slug" hint="Lowercase id, e.g. pack-25. Cannot change later.">
            <TextInput
              value={draft.slug}
              onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              placeholder="pack-25"
            />
          </FormField>
          <FormField label="Name">
            <TextInput
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="25 extra listings"
            />
          </FormField>
          <FormField label="Price (₹)">
            <TextInput
              type="number"
              min={1}
              value={draft.priceInr}
              onChange={(e) => setDraft((d) => ({ ...d, priceInr: Number(e.target.value) || 0 }))}
            />
          </FormField>
          <FormField label="Slots">
            <TextInput
              type="number"
              min={1}
              value={draft.slots}
              onChange={(e) => setDraft((d) => ({ ...d, slots: Number(e.target.value) || 1 }))}
            />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <TextInput
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <Button type="button" onClick={() => void createPlan()} disabled={saving}>
            {saving && !editingId ? "Saving…" : "Add pack"}
          </Button>
        </div>
      </Panel>

      <Panel title="Existing packs" rounded="3xl" padding="none">
        {loading ? (
          <p className="p-6 text-sm font-semibold text-charcoal/50">Loading…</p>
        ) : (
          <div className="divide-y divide-indigo/5">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-charcoal">{plan.name}</p>
                    <p className="text-xs text-charcoal/50 font-semibold">
                      {plan.slug} · ₹{plan.priceInr} · +{plan.slots} slots
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={plan.isActive ? "success" : "neutral"} size="sm">
                      {plan.isActive ? "On sale" : "Hidden"}
                    </Badge>
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(plan)}>
                      Edit
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => void toggleActive(plan)}>
                      {plan.isActive ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                {editingId === plan.id && editDraft ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl bg-sand/20 p-3">
                    <FormField label="Name">
                      <TextInput
                        value={editDraft.name}
                        onChange={(e) => setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                      />
                    </FormField>
                    <FormField label="Price (₹)">
                      <TextInput
                        type="number"
                        min={1}
                        value={editDraft.priceInr}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, priceInr: Number(e.target.value) || 0 } : d))
                        }
                      />
                    </FormField>
                    <FormField label="Slots">
                      <TextInput
                        type="number"
                        min={1}
                        value={editDraft.slots}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, slots: Number(e.target.value) || 1 } : d))
                        }
                      />
                    </FormField>
                    <FormField label="Description">
                      <TextInput
                        value={editDraft.description}
                        onChange={(e) =>
                          setEditDraft((d) => (d ? { ...d, description: e.target.value } : d))
                        }
                      />
                    </FormField>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="button" size="sm" onClick={() => void saveEdit(plan.id)} disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
