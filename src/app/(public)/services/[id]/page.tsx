"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
import { servicePlatformService } from "@/services";
import {
  Alert,
  Button,
  FormField,
  TextInput,
  TextArea,
} from "@/components/ui";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function ServiceProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { directoryProfiles, directoryProfilesReady, isLoggedIn, sessionReady, userProfile } =
    useApp();

  const profile = useMemo(
    () => directoryProfiles.find((p) => p.id === id) ?? null,
    [directoryProfiles, id]
  );

  const [preferredAt, setPreferredAt] = useState("");
  const [contactPhone, setContactPhone] = useState(userProfile?.phone || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile?.phone) setContactPhone(userProfile.phone);
  }, [userProfile?.phone]);

  const mapQuery = profile
    ? `${profile.address}, ${profile.city}, India`
    : "";

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const iso = new Date(preferredAt).toISOString();
      await servicePlatformService.createBooking(profile.id, {
        preferredAt: iso,
        contactPhone,
        message,
      });
      setSuccess(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book");
    } finally {
      setBusy(false);
    }
  };

  if (!directoryProfilesReady) {
    return (
      <div className="container mx-auto px-6 py-20 text-sm font-semibold text-charcoal/50">
        Loading profile…
      </div>
    );
  }

  if (!profile || !isServiceDirectoryCategory(profile.category)) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-lg text-center space-y-4">
        <h1 className="font-serif font-black text-2xl text-indigo">Service not found</h1>
        <Link href="/services" className="text-sm font-bold text-terracotta">
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-5xl pb-24 pt-8 space-y-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal/60 hover:text-terracotta"
      >
        <ArrowLeft className="w-4 h-4" />
        Services directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-sand rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-terracotta mb-2">
                  {profile.category}
                </p>
                <h1 className="font-serif font-black text-3xl text-indigo">{profile.firmName}</h1>
                <p className="text-sm font-semibold text-charcoal/60 mt-2">{profile.ownerName}</p>
              </div>
              {profile.verificationStatus === "verified" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              ) : null}
            </div>

            <p className="text-sm text-charcoal/70 font-semibold leading-relaxed mt-6">
              {profile.description}
            </p>

            {(profile.servicesOffered?.length ?? 0) > 0 ? (
              <div className="mt-6">
                <h2 className="text-xs font-black uppercase tracking-wider text-charcoal/40 mb-2">
                  Services offered
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.servicesOffered!.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-cream border border-sand text-xs font-bold text-charcoal/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 text-sm font-semibold text-charcoal/70">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                {profile.address}, {profile.city}
              </span>
              <a href={`tel:${profile.mobile}`} className="flex items-center gap-2 hover:text-indigo">
                <Phone className="w-4 h-4 text-terracotta" />
                {profile.mobile}
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 hover:text-indigo"
              >
                <Mail className="w-4 h-4 text-terracotta" />
                {profile.email}
              </a>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-3xl overflow-hidden shadow-sm h-[320px]">
            <iframe
              title={`Map for ${profile.firmName}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-sand rounded-3xl p-6 shadow-sm sticky top-24 space-y-4">
            <h2 className="font-serif font-black text-xl text-indigo">Book a visit</h2>
            <p className="text-xs text-charcoal/60 font-semibold">
              Request a preferred time. The service partner confirms from their manage page.
              {sessionReady && !isLoggedIn ? " Sign in required." : ""}
            </p>

            {success ? (
              <Alert
                variant="success"
                title="Request sent"
                description="You can track it under Service Bookings in your menu."
              />
            ) : null}
            {error ? <Alert variant="danger" title="Error" description={error} /> : null}

            <form onSubmit={submitBooking} className="space-y-4">
              <FormField label="Preferred date & time">
                <TextInput
                  type="datetime-local"
                  required
                  value={preferredAt}
                  onChange={(e) => setPreferredAt(e.target.value)}
                />
              </FormField>
              <FormField label="Contact phone">
                <TextInput
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </FormField>
              <FormField label="Message">
                <TextArea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need help with?"
                />
              </FormField>
              <Button type="submit" className="w-full" loading={busy}>
                {isLoggedIn ? "Request booking" : "Sign in to book"}
              </Button>
            </form>

            {success ? (
              <Link
                href="/my-service-bookings"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                View my service bookings
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
