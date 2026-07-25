"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Settings, Bell, User, ChevronRight, Shield } from "lucide-react";
import {
  Switch,
  SettingsRow,
  Panel,
  Alert,
  Button,
  EmptyState,
  CustomSelect,
} from "@/components/ui";
import { authService } from "@/services/auth";

export default function PublicSettingsPage() {
  const { isLoggedIn, userEmail } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"info" | "success" | "danger" | "warning">(
    "info"
  );
  const [resetBusy, setResetBusy] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    marketingEmails: true,
    profileVisibility: "public",
    language: "English",
  });

  const triggerToast = (
    msg: string,
    tone: "info" | "success" | "danger" | "warning" = "info"
  ) => {
    setToastTone(tone);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    triggerToast(
      "Preference updated on this device only — server sync is not available yet.",
      "warning"
    );
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    triggerToast(
      "Preference updated on this device only — server sync is not available yet.",
      "warning"
    );
  };

  const handlePasswordReset = async () => {
    if (!userEmail) {
      triggerToast("No signed-in email found.", "danger");
      return;
    }
    setResetBusy(true);
    try {
      await authService.resetPassword(userEmail);
      triggerToast(
        "If an account exists for your email, a password reset link has been sent.",
        "success"
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : "Unable to send reset email",
        "danger"
      );
    } finally {
      setResetBusy(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <EmptyState
          title="Sign In Required"
          description="Please login to access settings."
          icon={<Settings className="w-8 h-8 text-indigo/40" />}
        >
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              Sign In
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 max-w-sm">
          <Alert
            variant={toastTone}
            title={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-black text-charcoal">Account Settings</h1>
        <p className="text-charcoal/50 text-sm font-semibold mt-1">
          Manage security and device preferences
        </p>
      </div>

      <div className="space-y-6">
        <Alert
          variant="info"
          title="Notification preferences are local"
          description="Toggles below are stored on this device only and do not change server push routing yet."
        />

        <Panel title="Notification Preferences" padding="lg" rounded="3xl">
          <div className="-my-2">
            <SettingsRow
              label="Email Alerts"
              description="Receive immediate notifications about price drops and new shortlisted matches."
              icon={<Bell className="w-4 h-4" />}
              accent="indigo"
            >
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
                accent="indigo"
                aria-label="Email Alerts"
              />
            </SettingsRow>
            <SettingsRow
              label="SMS/WhatsApp Alerts"
              description="Receive mobile alerts when a broker accepts your tour schedule or sends a message."
              icon={<Bell className="w-4 h-4" />}
              accent="indigo"
            >
              <Switch
                checked={settings.smsAlerts}
                onCheckedChange={() => handleToggle("smsAlerts")}
                accent="indigo"
                aria-label="SMS/WhatsApp Alerts"
              />
            </SettingsRow>
            <SettingsRow
              label="Weekly Digest Recommendations"
              description="A curated list of handpicked properties matching your favorite cities and size requirements."
              icon={<Bell className="w-4 h-4" />}
              accent="indigo"
            >
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={() => handleToggle("marketingEmails")}
                accent="indigo"
                aria-label="Weekly Digest Recommendations"
              />
            </SettingsRow>
          </div>
        </Panel>

        <Panel title="Preferences & Privacy" padding="lg" rounded="3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">
                Search Region Language
              </label>
              <CustomSelect
                options={["English", "Hindi", "Gujarati", "Rajasthani"].map((lang) => ({
                  label: lang,
                  value: lang,
                }))}
                value={settings.language}
                onChange={(v) => handleSelectChange("language", v)}
                accent="indigo"
                buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">
                Profile Directory Visibility
              </label>
              <CustomSelect
                options={[
                  {
                    label: "Public (Visible to all brokers & listings owners)",
                    value: "public",
                  },
                  {
                    label: "Private (Only visible to you & site admins)",
                    value: "private",
                  },
                ]}
                value={settings.profileVisibility}
                onChange={(v) => handleSelectChange("profileVisibility", v)}
                accent="indigo"
                buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
              />
            </div>
          </div>
        </Panel>

        <Panel title="Security" padding="lg" rounded="3xl">
          <div className="-my-2">
            <SettingsRow
              label="Two-Factor Authentication (2FA)"
              description="Authenticator MFA is not enabled on this project yet."
              icon={<Shield className="w-4 h-4" />}
              accent="indigo"
            >
              <BadgeUnavailable />
            </SettingsRow>
            <SettingsRow
              label="Update Login Password"
              description={`Send a reset link to ${userEmail}.`}
              icon={<Shield className="w-4 h-4" />}
              accent="indigo"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={resetBusy}
                onClick={() => void handlePasswordReset()}
              >
                Send password reset email
              </Button>
            </SettingsRow>
          </div>
        </Panel>

        <div className="bg-sand/20 border border-sand/35 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo" />
            <div>
              <p className="text-xs font-bold text-charcoal">
                Looking to edit your public details, bio, or contact information?
              </p>
              <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                Display name and phone numbers are visible on submitted enquiries.
              </p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="secondary" size="sm">
              Edit Profile
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BadgeUnavailable() {
  return (
    <span className="text-[10px] font-black uppercase tracking-wider text-charcoal/40 bg-sand/40 border border-indigo/10 px-2.5 py-1 rounded-lg">
      Unavailable
    </span>
  );
}
