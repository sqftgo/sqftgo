"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  Lock,
  Bell,
  Globe,
  Shield,
  Trash2,
  AlertTriangle,
  User,
  KeyRound,
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

export default function DealerSettingsPage() {
  const { userEmail } = useApp();
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState(
    "Device preferences updated. These are not synced to the server yet."
  );
  const [saveTone, setSaveTone] = useState<"success" | "warning" | "danger">("warning");
  const [resetBusy, setResetBusy] = useState(false);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    email: userEmail || "",
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    showPhone: true,
    showEmail: false,
    language: "en",
    timezone: "Asia/Kolkata",
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaveTone("warning");
    setSaveMessage(
      "Preferences saved on this device only — server sync is not available yet."
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    setResetBusy(true);
    try {
      const { authService } = await import("@/services/auth");
      await authService.resetPassword(userEmail);
      setSaveTone("success");
      setSaveMessage(
        "If an account exists for your email, a password reset link has been sent."
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      setSaveTone("danger");
      setSaveMessage(err instanceof Error ? err.message : "Unable to send reset email");
      setSaved(true);
    } finally {
      setResetBusy(false);
    }
  };

  const handleDeactivate = () => {
    setDeactivateConfirmOpen(false);
    setSaveTone("warning");
    setSaveMessage(
      "Account deactivation is not available yet. Contact support if you need to close your dealer account."
    );
    setSaved(true);
  };

  return (
    <div className="bg-[#faf8f5] min-h-full text-charcoal w-full space-y-6">
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
          variant={saveTone}
          title={saveTone === "success" ? "Done" : saveTone === "danger" ? "Error" : "Note"}
          description={saveMessage}
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
                disabled
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

          <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
            In-app password change is not available yet. Request a reset email for{" "}
            <strong>{userEmail}</strong>, then complete the flow on the update-password page.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={resetBusy}
            onClick={() => void handlePasswordReset()}
          >
            <KeyRound className="w-3.5 h-3.5" /> Send password reset email
          </Button>
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
        onClose={() => setDeactivateConfirmOpen(false)}
        onConfirm={handleDeactivate}
        title="Account deactivation unavailable"
        description="Self-serve deactivation is not wired yet. Closing this dialog acknowledges that no account change will be made."
        confirmLabel="Got it"
        tone="warning"
      />
    </div>
  );
}
