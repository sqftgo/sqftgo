"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  FormField,
  TextInput,
  TextArea,
  Panel,
  CustomSelect,
} from "@/components/ui";

const CITY_OPTIONS = [
  "Udaipur",
  "Jaipur",
  "Jodhpur",
  "Jaisalmer",
  "Kota",
  "Ahmedabad",
  "Surat",
  "Mumbai",
  "Delhi",
].map((c) => ({ label: c, value: c }));

export default function EditProfilePage() {
  const { userEmail, userName, setUserName } = useApp();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: userName || "",
    phone: "",
    city: "Udaipur",
    bio: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (setUserName) setUserName(form.name);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/profile");
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          aria-label="Go back"
          className="px-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-serif font-black text-charcoal">Edit Profile</h1>
      </div>

      {saved && (
        <Alert variant="success" title="Profile updated!" className="mb-5" />
      )}

      <form onSubmit={handleSave}>
        <Panel padding="lg" rounded="3xl" className="shadow-lg space-y-5 bg-white/80">
          <FormField label="Display Name" required>
            <TextInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </FormField>

          <FormField label="Phone">
            <TextInput
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </FormField>

          <FormField label="Email (Read-only)">
            <TextInput value={userEmail} disabled />
          </FormField>

          <FormField label="City">
            <CustomSelect
              options={CITY_OPTIONS}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              accent="indigo"
              buttonClassName="bg-sand/30 border border-indigo/10 text-sm font-semibold px-4 py-3 rounded-xl text-charcoal"
            />
          </FormField>

          <FormField label="Bio">
            <TextArea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-indigo/5">
            <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </Panel>
      </form>
    </div>
  );
}
