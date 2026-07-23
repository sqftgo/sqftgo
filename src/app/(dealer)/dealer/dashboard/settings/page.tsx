"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  Lock,
  Bell,
  Globe,
  Shield,
  CreditCard,
  Trash2,
  AlertTriangle,
  User,
  KeyRound,
  Eye,
  EyeOff,
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
  Badge,
  CustomSelect,
} from "@/components/ui";

export default function DealerSettingsPage() {
  const { userEmail } = useApp();
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  const [form, setForm] = useState({
    email: userEmail || "dealer@sqftgo.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    publicProfile: true,
    showPhone: true,
    showEmail: false,
    language: "en",
    timezone: "Asia/Kolkata",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeactivate = () => {
    if (!confirmPasswordInput) return;
    alert(
      "Account deactivation request submitted. In a production build, this would revoke your API tokens."
    );
    setDeactivateConfirmOpen(false);
    setConfirmPasswordInput("");
  };

  const closeDeactivate = () => {
    setDeactivateConfirmOpen(false);
    setConfirmPasswordInput("");
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Configure system configurations, security preferences, and invoices."
        className="rounded-3xl"
        actions={
          <Button type="button" variant="secondary" onClick={() => handleSave()} size="md">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        }
      />

      {saved && (
        <Alert
          variant="success"
          title="Preferences Updated"
          description="Your setting overrides have been updated successfully."
          onDismiss={() => setSaved(false)}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Panel padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
            <User className="w-4 h-4 text-indigo" />
            <h2 className="text-sm font-serif font-black text-charcoal">Account Configurations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Email Address">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="broker@sqftgo.com"
                className="focus:border-indigo/40 focus:ring-indigo/10"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Language Preference">
                <CustomSelect
                  options={[
                    { label: "English (US)", value: "en" },
                    { label: "हिन्दी (IN)", value: "hi" },
                  ]}
                  value={form.language}
                  onChange={(v) => set("language", v)}
                  accent="indigo"
                  buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
                />
              </FormField>
              <FormField label="Local Timezone">
                <CustomSelect
                  options={[
                    { label: "Kolkata (GMT+5:30)", value: "Asia/Kolkata" },
                    { label: "London (GMT+0)", value: "UTC" },
                  ]}
                  value={form.timezone}
                  onChange={(v) => set("timezone", v)}
                  accent="indigo"
                  buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
                />
              </FormField>
            </div>
          </div>
        </Panel>

        <Panel padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
            <Lock className="w-4 h-4 text-indigo" />
            <h2 className="text-sm font-serif font-black text-charcoal">Security & Password</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Current Password", k: "currentPassword" },
              { label: "New Password", k: "newPassword" },
              { label: "Confirm New Password", k: "confirmPassword" },
            ].map(({ label, k }) => (
              <FormField key={k} label={label}>
                <div className="relative">
                  <TextInput
                    type={showPassword[k] ? "text" : "password"}
                    value={(form as any)[k]}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 focus:border-indigo/40 focus:ring-indigo/10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(k)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/45 hover:text-indigo focus:outline-none cursor-pointer"
                  >
                    {showPassword[k] ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </FormField>
            ))}
          </div>

          <p className="text-[9px] text-charcoal/40 font-semibold flex items-center gap-1.5 mt-2">
            <KeyRound className="w-3.5 h-3.5 text-indigo/60" /> Password requirements: Must be at
            least 8 characters containing numbers and symbols.
          </p>
        </Panel>

        <Panel padding="lg" rounded="3xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5 mb-2">
            <Bell className="w-4 h-4 text-indigo" />
            <h2 className="text-sm font-serif font-black text-charcoal">
              Notification Configurations
            </h2>
          </div>

          <SettingsRow
            label="Email Alerts"
            description="Send instant alerts on listing approvals, inquiries, and offers to your registered email."
            icon={<Globe className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.emailNotifications}
              onCheckedChange={(v) => set("emailNotifications", v)}
              aria-label="Email Alerts"
            />
          </SettingsRow>

          <SettingsRow
            label="SMS Verification & Leads"
            description="Get real-time mobile notifications and quick SMS updates when buyers send messages."
            icon={<Bell className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.smsNotifications}
              onCheckedChange={(v) => set("smsNotifications", v)}
              aria-label="SMS Verification & Leads"
            />
          </SettingsRow>

          <SettingsRow
            label="Marketing & Sourcing Tips"
            description="Receive curated advice, real estate market insights, and promotional updates from SqftGo."
            icon={<Globe className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.marketingEmails}
              onCheckedChange={(v) => set("marketingEmails", v)}
              aria-label="Marketing & Sourcing Tips"
            />
          </SettingsRow>
        </Panel>

        <Panel padding="lg" rounded="3xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5 mb-2">
            <Shield className="w-4 h-4 text-indigo" />
            <h2 className="text-sm font-serif font-black text-charcoal">
              Privacy & Directory Settings
            </h2>
          </div>

          <SettingsRow
            label="Visible Public Profile"
            description="Display your brokerage agency in the public directories so users can search you."
            icon={<Shield className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.publicProfile}
              onCheckedChange={(v) => set("publicProfile", v)}
              aria-label="Visible Public Profile"
            />
          </SettingsRow>

          <SettingsRow
            label="Display Contact Number"
            description="Show your direct phone number on search property detail panels."
            icon={<Shield className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.showPhone}
              onCheckedChange={(v) => set("showPhone", v)}
              aria-label="Display Contact Number"
            />
          </SettingsRow>

          <SettingsRow
            label="Display Public Email"
            description="Show your brokerage email address on the public directory cards."
            icon={<Shield className="w-4 h-4" />}
            accent="indigo"
          >
            <Switch
              accent="indigo"
              checked={form.showEmail}
              onCheckedChange={(v) => set("showEmail", v)}
              aria-label="Display Public Email"
            />
          </SettingsRow>
        </Panel>

        <Panel padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
            <CreditCard className="w-4 h-4 text-indigo" />
            <h2 className="text-sm font-serif font-black text-charcoal">Billing Summary</h2>
          </div>

          <div className="bg-sand/20 rounded-2xl p-5 border border-indigo/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="primary" size="sm">
                  Pro Partner
                </Badge>
                <span className="text-xs text-charcoal font-bold">Plan Active</span>
              </div>
              <p className="text-[10px] text-charcoal/45 font-semibold mt-1.5 leading-relaxed">
                Next billing invoice date: <strong className="text-indigo">15 August 2026</strong>.
              </p>
            </div>

            <div className="flex items-baseline gap-1 bg-white/70 border border-indigo/5 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto">
              <span className="text-xs text-charcoal/50 font-bold">Amount:</span>
              <span className="text-base font-serif font-black text-charcoal">₹1,500</span>
              <span className="text-[10px] text-charcoal/40 font-semibold">/month</span>
            </div>
          </div>
        </Panel>

        <Panel
          padding="lg"
          rounded="3xl"
          className="bg-rose-500/[0.02] border-rose-500/15 space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/10">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-serif font-black text-rose-600">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-lg">
              <h3 className="text-xs font-bold text-rose-600">
                Temporarily Deactivate Partner Account
              </h3>
              <p className="text-[10px] text-rose-500/60 font-semibold mt-0.5 leading-relaxed">
                Once deactivated, your active property listings will be suspended, and your directory
                page will be hidden.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeactivateConfirmOpen(true)}
              className="bg-rose-50 hover:bg-rose-100/70 border-rose-200 text-rose-600 shadow-none self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" /> Deactivate Account
            </Button>
          </div>
        </Panel>
      </form>

      <ConfirmDialog
        open={deactivateConfirmOpen}
        onClose={closeDeactivate}
        onConfirm={handleDeactivate}
        title="Are you absolutely sure?"
        description="This action will hide your listings and your public profile immediately. You can re-enable your account by logging in again later."
        confirmLabel="Confirm Deactivation"
        tone="danger"
      >
        <FormField label="Type your account password to confirm">
          <TextInput
            type="password"
            required
            value={confirmPasswordInput}
            onChange={(e) => setConfirmPasswordInput(e.target.value)}
            placeholder="••••••••"
            className="focus:border-rose-500/50 focus:ring-rose-100"
          />
        </FormField>
      </ConfirmDialog>
    </div>
  );
}
