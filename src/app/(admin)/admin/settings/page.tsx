"use client";

import React, { useState } from "react";
import {
  Save,
  Globe,
  Bell,
  Shield,
  CreditCard,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import {
  DashboardPageHeader,
  Button,
  Alert,
  ConfirmDialog,
  Panel,
  SettingsRow,
  Switch,
  FormField,
  TextInput,
  CustomSelect,
} from "@/components/ui";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [maintenanceConfirmOpen, setMaintenanceConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    siteName: "Sun Valley Real Estate",
    tagline: "Rajasthan's Premier Property Marketplace",
    supportEmail: "support@svrepl.com",
    phone: "+91 294 2400000",
    requireApproval: true,
    allowDealerRegistration: true,
    maintenanceMode: false,
    maxImagesPerListing: "10",
    maxListingsPerDealer: "25",
    inquiryNotifications: true,
    googleAnalyticsId: "UA-XXXXXXXXX",
    razorpayEnabled: true,
    defaultCurrency: "INR",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked && !form.maintenanceMode) {
      setMaintenanceConfirmOpen(true);
    } else if (!checked) {
      set("maintenanceMode", false);
    }
  };

  const confirmMaintenanceMode = () => {
    set("maintenanceMode", true);
    setMaintenanceConfirmOpen(false);
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Platform Settings"
        description="Configure system configurations, listing requirements, payment pathways, and site parameters."
        className="rounded-3xl"
        actions={
          <Button type="button" onClick={() => handleSave()} size="md">
            <Save className="w-4 h-4" /> Save Configurations
          </Button>
        }
      />

      {saved && (
        <Alert
          variant="success"
          title="Configurations Saved"
          description="System preferences updated and live across all nodes."
          onDismiss={() => setSaved(false)}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Panel padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
            <Globe className="w-4 h-4 text-terracotta" />
            <h2 className="text-sm font-serif font-black text-charcoal">General Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Site Brand Title">
              <TextInput
                type="text"
                value={form.siteName}
                onChange={(e) => set("siteName", e.target.value)}
              />
            </FormField>

            <FormField label="Support Helpline Email">
              <TextInput
                type="email"
                value={form.supportEmail}
                onChange={(e) => set("supportEmail", e.target.value)}
              />
            </FormField>

            <FormField label="Tagline Slogan">
              <TextInput
                type="text"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </FormField>

            <FormField label="Helpline Phone">
              <TextInput
                type="text"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </FormField>
          </div>
        </Panel>

        <Panel padding="lg" rounded="3xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5 mb-2">
            <Shield className="w-4 h-4 text-terracotta" />
            <h2 className="text-sm font-serif font-black text-charcoal">
              Listing Approval & Registration Rules
            </h2>
          </div>

          <SettingsRow
            label="Require Admin Review"
            description="Force newly added or edited listings into Pending Review state before going live."
            icon={<Sliders className="w-4 h-4" />}
            accent="terracotta"
          >
            <Switch
              accent="terracotta"
              checked={form.requireApproval}
              onCheckedChange={(v) => set("requireApproval", v)}
              aria-label="Require Admin Review"
            />
          </SettingsRow>

          <SettingsRow
            label="Enable Dealer Registration"
            description="Allow prospective real estate brokers to sign up on the public interface."
            icon={<Sliders className="w-4 h-4" />}
            accent="terracotta"
          >
            <Switch
              accent="terracotta"
              checked={form.allowDealerRegistration}
              onCheckedChange={(v) => set("allowDealerRegistration", v)}
              aria-label="Enable Dealer Registration"
            />
          </SettingsRow>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-indigo/5 mt-3">
            <FormField label="Max Images Per Listing">
              <TextInput
                type="number"
                value={form.maxImagesPerListing}
                onChange={(e) => set("maxImagesPerListing", e.target.value)}
              />
            </FormField>

            <FormField label="Max Listings Per Dealer Limit">
              <TextInput
                type="number"
                value={form.maxListingsPerDealer}
                onChange={(e) => set("maxListingsPerDealer", e.target.value)}
              />
            </FormField>
          </div>
        </Panel>

        <Panel padding="lg" rounded="3xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5 mb-2">
            <Bell className="w-4 h-4 text-terracotta" />
            <h2 className="text-sm font-serif font-black text-charcoal">
              Global Notifications Preference
            </h2>
          </div>

          <SettingsRow
            label="Platform Enquiry Email Notifications"
            description="Send direct email copies to administrator on new user inquiries, reports, and feedback."
            icon={<Bell className="w-4 h-4" />}
            accent="terracotta"
          >
            <Switch
              accent="terracotta"
              checked={form.inquiryNotifications}
              onCheckedChange={(v) => set("inquiryNotifications", v)}
              aria-label="Platform Enquiry Email Notifications"
            />
          </SettingsRow>
        </Panel>

        <Panel padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
            <CreditCard className="w-4 h-4 text-terracotta" />
            <h2 className="text-sm font-serif font-black text-charcoal">
              Payment & Analytics Integrations
            </h2>
          </div>

          <SettingsRow
            label="Razorpay Payment Gateway"
            description="Allow dealers to purchase subscriptions online using the integrated Razorpay SDK."
            icon={<CreditCard className="w-4 h-4" />}
            accent="terracotta"
          >
            <Switch
              accent="terracotta"
              checked={form.razorpayEnabled}
              onCheckedChange={(v) => set("razorpayEnabled", v)}
              aria-label="Razorpay Payment Gateway"
            />
          </SettingsRow>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-indigo/5">
            <FormField label="Google Analytics Measurement ID">
              <TextInput
                type="text"
                value={form.googleAnalyticsId}
                onChange={(e) => set("googleAnalyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </FormField>

            <FormField label="Payment Settlements Currency">
              <CustomSelect
                options={[
                  { label: "Indian Rupee (INR)", value: "INR" },
                  { label: "US Dollar (USD)", value: "USD" },
                  { label: "Euro (EUR)", value: "EUR" },
                ]}
                value={form.defaultCurrency}
                onChange={(v) => set("defaultCurrency", v)}
                accent="terracotta"
                buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
              />
            </FormField>
          </div>
        </Panel>

        <Panel
          padding="lg"
          rounded="3xl"
          className="bg-amber-500/[0.02] border-amber-500/15 space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-serif font-black text-amber-700">Platform Maintenance</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-lg">
              <h3 className="text-xs font-bold text-amber-700">Toggle Maintenance Offline Mode</h3>
              <p className="text-[10px] text-amber-600/60 font-semibold mt-0.5 leading-relaxed">
                When active, public users will see a maintenance message, and non-admin logins will be
                blocked.
              </p>
            </div>

            <Switch
              accent="terracotta"
              checked={form.maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
              aria-label="Toggle Maintenance Offline Mode"
            />
          </div>
        </Panel>
      </form>

      <ConfirmDialog
        open={maintenanceConfirmOpen}
        onClose={() => setMaintenanceConfirmOpen(false)}
        onConfirm={confirmMaintenanceMode}
        title="Activate Maintenance Mode?"
        description="This will take the entire marketplace offline for regular users immediately. Only administrators will be able to access portal panels."
        confirmLabel="Yes, Go Offline"
        tone="warning"
      />
    </div>
  );
}
