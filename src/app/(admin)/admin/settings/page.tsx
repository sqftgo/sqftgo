"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { platformService } from "@/services";
import type { PlatformSettings } from "@/types";
import { Settings } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Button,
  FormField,
  TextInput,
  Panel,
} from "@/components/ui";

type FormState = Omit<PlatformSettings, "updatedAt" | "updatedBy">;

const emptyForm: FormState = {
  siteName: "SqftGo",
  tagline: "",
  supportEmail: null,
  supportPhone: null,
  maintenanceMode: false,
  requireListingApproval: true,
  allowUserListings: true,
  maxListingsPerDealer: null,
  maxListingsPerUser: 2,
  currencyCode: "INR",
  analyticsMeasurementId: null,
};

export default function AdminSettingsPage() {
  const { addLog, userEmail } = useApp();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [meta, setMeta] = useState<{ updatedAt: string; updatedBy: string | null } | null>(
    null
  );

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
          allowUserListings: settings.allowUserListings,
          maxListingsPerDealer: settings.maxListingsPerDealer,
          maxListingsPerUser: settings.maxListingsPerUser,
          currencyCode: settings.currencyCode,
          analyticsMeasurementId: settings.analyticsMeasurementId,
        });
        setMeta({ updatedAt: settings.updatedAt, updatedBy: settings.updatedBy });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await platformService.updateSettings({
        ...form,
        supportEmail: form.supportEmail?.trim() || null,
        supportPhone: form.supportPhone?.trim() || null,
        analyticsMeasurementId: form.analyticsMeasurementId?.trim() || null,
        maxListingsPerDealer:
          form.maxListingsPerDealer && form.maxListingsPerDealer > 0
            ? form.maxListingsPerDealer
            : null,
        maxListingsPerUser: form.maxListingsPerUser > 0 ? form.maxListingsPerUser : 2,
      });
      setForm({
        siteName: updated.siteName,
        tagline: updated.tagline,
        supportEmail: updated.supportEmail,
        supportPhone: updated.supportPhone,
        maintenanceMode: updated.maintenanceMode,
        requireListingApproval: updated.requireListingApproval,
        allowUserListings: updated.allowUserListings,
        maxListingsPerDealer: updated.maxListingsPerDealer,
        maxListingsPerUser: updated.maxListingsPerUser,
        currencyCode: updated.currencyCode,
        analyticsMeasurementId: updated.analyticsMeasurementId,
      });
      setMeta({ updatedAt: updated.updatedAt, updatedBy: updated.updatedBy });
      addLog({
        action: "Platform settings updated",
        performedBy: userEmail,
        role: "Admin",
        target: "platform_settings",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
      <DashboardPageHeader
        title="Platform Settings"
        description="Site identity, support contacts, and listing policy. Changes apply immediately."
      />

      {error ? (
        <Alert
          variant="danger"
          title="Settings error"
          description={error}
          onDismiss={() => setError(null)}
        />
      ) : null}

      {loading ? (
        <Alert variant="info" title="Loading" description="Fetching platform settings…" />
      ) : (
        <Panel padding="lg" rounded="3xl" className="space-y-5">
          <div className="flex items-center gap-2 text-charcoal/40">
            <Settings className="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-wider">
              {meta?.updatedAt
                ? `Last updated ${new Date(meta.updatedAt).toLocaleString()}`
                : "Singleton platform config"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Site name" required>
              <TextInput
                value={form.siteName}
                onChange={(e) => setField("siteName", e.target.value)}
              />
            </FormField>
            <FormField label="Currency code" required>
              <TextInput
                value={form.currencyCode}
                onChange={(e) => setField("currencyCode", e.target.value.toUpperCase())}
                maxLength={3}
              />
            </FormField>
          </div>

          <FormField label="Tagline" required>
            <TextInput
              value={form.tagline}
              onChange={(e) => setField("tagline", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Support email">
              <TextInput
                type="email"
                value={form.supportEmail ?? ""}
                onChange={(e) => setField("supportEmail", e.target.value || null)}
              />
            </FormField>
            <FormField label="Support phone">
              <TextInput
                value={form.supportPhone ?? ""}
                onChange={(e) => setField("supportPhone", e.target.value || null)}
              />
            </FormField>
          </div>

          <FormField label="Analytics measurement ID">
            <TextInput
              value={form.analyticsMeasurementId ?? ""}
              onChange={(e) => setField("analyticsMeasurementId", e.target.value || null)}
              placeholder="G-XXXXXXXX"
            />
          </FormField>

          <FormField label="Max listings per dealer">
            <TextInput
              type="number"
              min={1}
              value={form.maxListingsPerDealer ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                setField("maxListingsPerDealer", raw ? Number(raw) : null);
              }}
              placeholder="Leave empty for unlimited"
            />
          </FormField>

          <FormField label="Max listings per client">
            <TextInput
              type="number"
              min={1}
              max={20}
              value={form.maxListingsPerUser}
              onChange={(e) => {
                const raw = e.target.value.trim();
                setField("maxListingsPerUser", raw ? Number(raw) : 2);
              }}
            />
          </FormField>

          <div className="space-y-3 pt-2 border-t border-indigo/5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.requireListingApproval}
                onChange={(e) => setField("requireListingApproval", e.target.checked)}
              />
              <span>
                <span className="block text-sm font-bold text-charcoal">
                  Require listing approval
                </span>
                <span className="block text-xs text-charcoal/50 font-semibold mt-0.5">
                  Brokers and clients submit for review before listings go live.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.allowUserListings}
                onChange={(e) => setField("allowUserListings", e.target.checked)}
              />
              <span>
                <span className="block text-sm font-bold text-charcoal">
                  Allow client listings
                </span>
                <span className="block text-xs text-charcoal/50 font-semibold mt-0.5">
                  Signed-in users can submit up to the client listing limit. Admin still approves each listing.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.maintenanceMode}
                onChange={(e) => setField("maintenanceMode", e.target.checked)}
              />
              <span>
                <span className="block text-sm font-bold text-charcoal">Maintenance mode</span>
                <span className="block text-xs text-charcoal/50 font-semibold mt-0.5">
                  Show maintenance messaging to visitors when enabled.
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
            {saved ? (
              <span className="text-xs font-bold text-emerald-600">Saved</span>
            ) : null}
          </div>
        </Panel>
      )}
    </div>
  );
}
