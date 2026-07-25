"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  Shield,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
} from "lucide-react";
import {
  DashboardPageHeader,
  Button,
  Alert,
  Panel,
  Avatar,
  FormField,
  TextInput,
  TextArea,
  Badge,
} from "@/components/ui";

export default function AdminProfilePage() {
  const { userEmail, userName, userProfile, updateProfile } = useApp();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: userName || userProfile?.name || "",
    email: userEmail || userProfile?.email || "",
    phone: userProfile?.phone || "",
    bio: userProfile?.bio || "",
  });

  useEffect(() => {
    setForm({
      name: userName || userProfile?.name || "",
      email: userEmail || userProfile?.email || "",
      phone: userProfile?.phone || "",
      bio: userProfile?.bio || "",
    });
  }, [userEmail, userName, userProfile]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Admin Profile"
        description="Update your account name, phone, and bio."
        className="rounded-3xl"
        actions={
          <Button
            type="button"
            onClick={() => void handleSave()}
            size="md"
            loading={busy}
          >
            <Save className="w-4 h-4" /> Save Profile Info
          </Button>
        }
      />

      {error && (
        <Alert
          variant="danger"
          title="Could not save"
          description={error}
          onDismiss={() => setError(null)}
        />
      )}

      {saved && (
        <Alert
          variant="success"
          title="Profile Update Complete"
          description="Your admin account profile was updated."
          onDismiss={() => setSaved(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          padding="lg"
          rounded="3xl"
          className="lg:col-span-1 flex flex-col items-center text-center space-y-4"
        >
          <Avatar name={form.name || "A"} size="xl" tone="terracotta" shape="rounded" />

          <div>
            <h2 className="text-base font-serif font-black text-charcoal leading-snug">
              {form.name || "Admin"}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <Badge
                tone="warning"
                size="sm"
                className="bg-terracotta/5 text-terracotta border-terracotta/10"
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>

          <div className="w-full h-px bg-indigo/5" />

          <div className="w-full text-left space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-charcoal/60">
              <Mail className="w-4 h-4 text-charcoal/30" />
              <span className="truncate">{form.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-charcoal/60">
              <Phone className="w-4 h-4 text-charcoal/30" />
              <span>{form.phone || "No phone on file"}</span>
            </div>
          </div>
        </Panel>

        <form onSubmit={(e) => void handleSave(e)} className="lg:col-span-2">
          <Panel padding="lg" rounded="3xl" className="md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
                <FileText className="w-4 h-4 text-terracotta" />
                <h2 className="text-sm font-serif font-black text-charcoal">
                  Account Parameters
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <TextInput
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </FormField>

                <FormField label="Registered Admin Email">
                  <TextInput type="email" disabled value={form.email} />
                </FormField>

                <FormField label="Contact Phone">
                  <TextInput
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </FormField>

                <FormField label="Role">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-700 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Admin (managed via Users page / DB)</span>
                  </div>
                </FormField>

                <FormField label="Bio" className="sm:col-span-2">
                  <TextArea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </FormField>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-indigo/5">
              <Button type="submit" size="md" loading={busy}>
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>
          </Panel>
        </form>
      </div>
    </div>
  );
}
