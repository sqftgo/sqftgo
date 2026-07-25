"use client";
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Button,
  FormField,
  TextInput,
  TextArea,
  Panel,
  CustomSelect,
} from "@/components/ui";
import { uploadAvatar } from "@/lib/uploads/avatar";

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
  const { isLoggedIn, userEmail, userName, userProfile, updateProfile, sessionReady } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: userName || "",
    phone: userProfile?.phone || "",
    city: userProfile?.city || "Udaipur",
    bio: userProfile?.bio || "",
    avatarUrl: userProfile?.avatar || "",
  });

  useEffect(() => {
    if (!sessionReady) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    setForm({
      name: userName || userProfile?.name || "",
      phone: userProfile?.phone || "",
      city: userProfile?.city || "Udaipur",
      bio: userProfile?.bio || "",
      avatarUrl: userProfile?.avatar || "",
    });
  }, [sessionReady, isLoggedIn, userName, userProfile, router]);

  const handleAvatarPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl || null,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/profile");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setBusy(false);
    }
  };

  if (!sessionReady || !isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-sm text-charcoal/50 font-semibold">
        Loading profile…
      </div>
    );
  }

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

      {saved && <Alert variant="success" title="Profile updated!" className="mb-5" />}
      {error ? (
        <Alert variant="danger" title={error} className="mb-5" onDismiss={() => setError(null)} />
      ) : null}

      <form onSubmit={(e) => void handleSave(e)}>
        <Panel padding="lg" rounded="3xl" className="shadow-lg space-y-5 bg-white/80">
          <div className="flex items-center gap-4">
            <Avatar
              name={form.name || userEmail}
              src={form.avatarUrl || null}
              size="xl"
              shape="rounded"
              tone="indigo"
            />
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">
                Profile photo
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleAvatarPick(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5" />
                {uploading ? "Uploading…" : form.avatarUrl ? "Change photo" : "Upload photo"}
              </Button>
            </div>
          </div>

          <FormField label="Display Name" required>
            <TextInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              required
              minLength={2}
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
              maxLength={500}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-indigo/5">
            <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" disabled={busy || uploading}>
              <Save className="w-4 h-4" /> {busy ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </Panel>
      </form>
    </div>
  );
}
