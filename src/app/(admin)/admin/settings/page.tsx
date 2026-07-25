"use client";

import React, { useEffect, useState } from "react";
import { platformService } from "@/services";
import type { PlatformSettings } from "@/types";
import {
  DashboardPageHeader,
  Alert,
  Panel,
  FormField,
  TextInput,
  Switch,
  Button,
  SettingsRow,
} from "@/components/ui";

const empty: Omit<PlatformSettings, "updatedAt" | "updatedBy"> = {
  siteName: "SqftGo",
  tagline: "Rajasthan Real Estate Marketplace",
  supportEmail: null,
  supportPhone: null,
  maintenanceMode: false,
  requireListingApproval: true,
  maxListingsPerDealer: null,
  currencyCode: "INR",
  analyticsMeasurementId: null,
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const settings = await platformService.getSettings();
        if (cancelled) return;
        setForm({
          siteName: settings.siteName,
          tagline: settings.tagline,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          maintenanceMode: settings.maintenanceMode,
          requireListingApproval: settings.requireListingApproval,
          maxListingsPerDealer: settings.maxListingsPerDealer,
          currencyCode: settings.currencyCode,
          analyticsMeasurementId: settings.analyticsMeasurementId,
        });
        setSavedAt(settings.updatedAt);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await platformService.updateSettings(form);
      setSavedAt(updated.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Platform Settings"
        description="Persisted in platform_settings. Payment provider secrets stay in environment variables."
        className="rounded-3xl"
        actions={
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save settings"}
          </Button>
        }
      />

      <Alert
        variant="info"
        title="Payments are env-only"
        description="Razorpay / billing credentials are not stored here. Configure them via server environment variables when billing ships."
      />

      {error ? (
        <Alert variant="danger" title="Settings error" description={error} />
      ) : null}
      {savedAt && !error ? (
        <Alert
          variant="success"
          title="Loaded"
          description={`Last updated ${new Date(savedAt).toLocaleString()}`}
        />
      ) : null}

      <Panel padding="lg" rounded="3xl" className="space-y-5">
        <h2 className="text-sm font-serif font-black">Brand & support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Site name" required>
            <TextInput
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              disabled={loading}
            />
          </FormField>
          <FormField label="Currency code" required>
            <TextInput
              value={form.currencyCode}
              onChange={(e) => set("currencyCode", e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={3}
            />
          </FormField>
          <FormField label="Tagline" required className="md:col-span-2">
            <TextInput
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              disabled={loading}
            />
          </FormField>
          <FormField label="Support email">
            <TextInput
              value={form.supportEmail ?? ""}
              onChange={(e) => set("supportEmail", e.target.value || null)}
              disabled={loading}
            />
          </FormField>
          <FormField label="Support phone">
            <TextInput
              value={form.supportPhone ?? ""}
              onChange={(e) => set("supportPhone", e.target.value || null)}
              disabled={loading}
            />
          </FormField>
          <FormField label="Analytics measurement ID" className="md:col-span-2">
            <TextInput
              value={form.analyticsMeasurementId ?? ""}
              onChange={(e) =>
                set("analyticsMeasurementId", e.target.value || null)
              }
              disabled={loading}
              placeholder="G-XXXXXXXX"
            />
          </FormField>
        </div>
      </Panel>

      <Panel padding="lg" rounded="3xl" className="space-y-2">
        <h2 className="text-sm font-serif font-black mb-2">Marketplace rules</h2>
        <SettingsRow
          label="Maintenance mode"
          description="When on, non-admin visitors are redirected to /maintenance for public marketplace pages."
        >
          <Switch
            checked={form.maintenanceMode}
            onCheckedChange={(v) => set("maintenanceMode", v)}
            disabled={loading}
            aria-label="Maintenance mode"
          />
        </SettingsRow>
        <SettingsRow
          label="Require listing approval"
          description="Policy flag for admin workflows (brokers still submit pending review via existing APIs)."
        >
          <Switch
            checked={form.requireListingApproval}
            onCheckedChange={(v) => set("requireListingApproval", v)}
            disabled={loading}
            aria-label="Require listing approval"
          />
        </SettingsRow>
        <FormField label="Max listings per dealer (optional)">
          <TextInput
            type="number"
            value={form.maxListingsPerDealer ?? ""}
            onChange={(e) => {
              const n = e.target.value ? Number(e.target.value) : null;
              set("maxListingsPerDealer", Number.isFinite(n as number) ? n : null);
            }}
            disabled={loading}
            placeholder="No cap"
          />
        </FormField>
      </Panel>
    </div>
  );
}
