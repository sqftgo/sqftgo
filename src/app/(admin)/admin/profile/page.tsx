"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  Shield,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  KeyRound,
  Terminal,
  Activity,
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
  const { userEmail } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "Admin User",
    email: userEmail || "admin@svrepl.com",
    phone: "+91 98000 00001",
    bio: "Platform administrator for Sun Valley Real Estate. Managing listing approvals, dealer registrations, and global system overrides.",
  });

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Admin Profile"
        description="Manage your credentials and credentials for the platform."
        className="rounded-3xl"
        actions={
          <Button type="button" onClick={() => handleSave()} size="md">
            <Save className="w-4 h-4" /> Save Profile Info
          </Button>
        }
      />

      {saved && (
        <Alert
          variant="success"
          title="Profile Update Complete"
          description="Your admin account parameters were updated successfully."
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
              {form.name}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <Badge tone="warning" size="sm" className="bg-terracotta/5 text-terracotta border-terracotta/10">
                <Shield className="w-3.5 h-3.5 mr-1" />
                Super Administrator
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
              <span>{form.phone}</span>
            </div>
          </div>
        </Panel>

        <form
          onSubmit={handleSave}
          className="lg:col-span-2"
        >
          <Panel padding="lg" rounded="3xl" className="md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-indigo/5">
                <FileText className="w-4 h-4 text-terracotta" />
                <h2 className="text-sm font-serif font-black text-charcoal">Account Parameters</h2>
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

                <FormField label="Permissions Clearance">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-700 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full Overlord Access</span>
                  </div>
                </FormField>

                <FormField label="Biographical Memo / Responsibility" className="sm:col-span-2">
                  <TextArea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </FormField>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-indigo/5">
              <div className="flex items-center gap-2.5 pb-1">
                <Activity className="w-4 h-4 text-terracotta" />
                <h2 className="text-xs font-serif font-black text-charcoal">Security Session State</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-indigo/5 bg-sand/10 rounded-2xl p-4 flex items-center gap-3">
                  <KeyRound className="w-8 h-8 text-terracotta/75 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold text-charcoal">Encryption Key</h4>
                    <p className="text-[9px] text-charcoal/40 mt-0.5">RSA 4096-bit signature active</p>
                  </div>
                </div>

                <div className="border border-indigo/5 bg-sand/10 rounded-2xl p-4 flex items-center gap-3">
                  <Terminal className="w-8 h-8 text-terracotta/75 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold text-charcoal">Audit Signatures</h4>
                    <p className="text-[9px] text-charcoal/40 mt-0.5">
                      All configuration updates are hashed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-indigo/5">
              <Button type="submit" size="md">
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>
          </Panel>
        </form>
      </div>
    </div>
  );
}
