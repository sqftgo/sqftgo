"use client";

import React, { useEffect, useState } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Button,
  Panel,
  TextInput,
} from "@/components/ui";
import {
  DEFAULT_PRICE_RANGES,
  PRICE_RANGE_GROUPS,
  formatPriceLabel,
  normalizePriceOptions,
  type PriceOption,
  type PriceRangeConfig,
  type PriceRangeGroupKey,
} from "@/features/admin";
import { platformService } from "@/services/platform";

export default function AdminPricingPage() {
  const [config, setConfig] = useState<PriceRangeConfig>(DEFAULT_PRICE_RANGES);
  const [drafts, setDrafts] = useState<Record<PriceRangeGroupKey, string>>({
    buyMin: "",
    buyMax: "",
    rentMin: "",
    rentMax: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [baseSettings, setBaseSettings] = useState<Awaited<
    ReturnType<typeof platformService.getSettings>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await platformService.getSettings();
        if (cancelled) return;
        setBaseSettings(settings);
        if (settings.priceRanges) setConfig(settings.priceRanges);
      } catch {
        if (!cancelled) setConfig(DEFAULT_PRICE_RANGES);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateGroup = (key: PriceRangeGroupKey, options: PriceOption[]) => {
    const meta = PRICE_RANGE_GROUPS.find((g) => g.key === key)!;
    setConfig((prev) => ({
      ...prev,
      [key]: normalizePriceOptions(options, meta.placeholderLabel),
    }));
  };

  const handleAdd = (key: PriceRangeGroupKey) => {
    const raw = drafts[key].trim().replace(/,/g, "");
    const amount = Number(raw);
    if (!raw || Number.isNaN(amount) || amount < 0) {
      setError("Enter a valid price amount in rupees (e.g. 5000000)");
      return;
    }
    setError(null);
    const value = String(Math.round(amount));
    const existing = config[key];
    if (existing.some((o) => o.value === value)) {
      setError("That price option already exists in this dropdown");
      return;
    }
    updateGroup(key, [
      ...existing,
      { label: formatPriceLabel(amount), value },
    ]);
    setDrafts((d) => ({ ...d, [key]: "" }));
  };

  const handleRemove = (key: PriceRangeGroupKey, value: string) => {
    if (!value) return;
    updateGroup(
      key,
      config[key].filter((o) => o.value !== value)
    );
  };

  const handleLabelChange = (
    key: PriceRangeGroupKey,
    value: string,
    label: string
  ) => {
    updateGroup(
      key,
      config[key].map((o) => (o.value === value ? { ...o, label } : o))
    );
  };

  const persist = async (next: PriceRangeConfig) => {
    if (!baseSettings) {
      setError("Settings not loaded yet. Refresh and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await platformService.updateSettings({
        siteName: baseSettings.siteName,
        tagline: baseSettings.tagline,
        supportEmail: baseSettings.supportEmail,
        supportPhone: baseSettings.supportPhone,
        maintenanceMode: baseSettings.maintenanceMode,
        requireListingApproval: baseSettings.requireListingApproval,
        allowUserListings: baseSettings.allowUserListings,
        maxListingsPerDealer: baseSettings.maxListingsPerDealer,
        maxListingsPerUser: baseSettings.maxListingsPerUser,
        currencyCode: baseSettings.currencyCode,
        analyticsMeasurementId: baseSettings.analyticsMeasurementId,
        priceRanges: next,
      });
      setBaseSettings(updated);
      if (updated.priceRanges) setConfig(updated.priceRanges);
      window.dispatchEvent(new Event("sqftgo:price-ranges-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save price ranges");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    const normalized = { ...config };
    for (const group of PRICE_RANGE_GROUPS) {
      normalized[group.key] = normalizePriceOptions(
        config[group.key],
        group.placeholderLabel
      );
    }
    setConfig(normalized);
    void persist(normalized);
  };

  const handleReset = () => {
    setConfig(DEFAULT_PRICE_RANGES);
    void persist(DEFAULT_PRICE_RANGES);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Pricing Management"
        description="Manage budget price options shown in listing filter dropdowns (saved to platform settings)"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={busy || !hydrated}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!hydrated || busy}>
              <Save className="w-3.5 h-3.5" /> {busy ? "Saving…" : "Save Ranges"}
            </Button>
          </div>
        }
      />

      {saved ? (
        <Alert variant="success" title="Price ranges saved for all users" onDismiss={() => setSaved(false)} />
      ) : null}
      {error ? (
        <Alert variant="danger" title={error} onDismiss={() => setError(null)} />
      ) : null}

      <Alert
        variant="info"
        title="Listing filter dropdowns"
        description="These options power the Min/Max budget selects on Buy/Sell and Rent/Lease filters across the marketplace."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {PRICE_RANGE_GROUPS.map((group) => {
          const options = config[group.key];
          const values = options.filter((o) => o.value !== "");
          return (
            <Panel
              key={group.key}
              title={group.title}
              description={group.description}
              padding="md"
              rounded="2xl"
              actions={
                <span className="text-[10px] font-black uppercase tracking-wider text-charcoal/35">
                  {values.length} options
                </span>
              }
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <TextInput
                    type="number"
                    min={0}
                    value={drafts[group.key]}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [group.key]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd(group.key);
                      }
                    }}
                    placeholder="Amount in ₹ (e.g. 2500000)"
                    className="flex-1"
                    aria-label={`Add ${group.title} amount`}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAdd(group.key)}
                    className="shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>

                <div className="rounded-xl border border-indigo/10 overflow-hidden">
                  <div className="px-3 py-2 bg-sand/40 border-b border-indigo/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
                      Dropdown label
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
                      Value (₹)
                    </span>
                  </div>
                  <div className="divide-y divide-indigo/5">
                    <div className="px-3 py-2.5 flex items-center justify-between gap-3 bg-cream/40">
                      <span className="text-xs font-bold text-charcoal/50">
                        {group.placeholderLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-charcoal/30">
                        Placeholder
                      </span>
                    </div>
                    {values.length === 0 ? (
                      <p className="px-3 py-4 text-xs font-semibold text-charcoal/40">
                        No price options yet. Add an amount above.
                      </p>
                    ) : (
                      values.map((option) => (
                        <div
                          key={option.value}
                          className="px-3 py-2.5 flex items-center gap-2 hover:bg-sand/20 transition-colors"
                        >
                          <TextInput
                            value={option.label}
                            onChange={(e) =>
                              handleLabelChange(group.key, option.value, e.target.value)
                            }
                            className="flex-1 py-1.5 text-xs"
                            aria-label={`Label for ${option.value}`}
                          />
                          <span className="text-[10px] font-bold text-charcoal/40 w-24 text-right shrink-0 tabular-nums">
                            {Number(option.value).toLocaleString("en-IN")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemove(group.key, option.value)}
                            className="p-1.5 text-charcoal/35 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            aria-label={`Remove ${option.label}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
