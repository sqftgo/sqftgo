"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
import { servicePlatformService } from "@/services";
import type { ServiceBooking, ServiceVerification } from "@/types";
import {
  Alert,
  Badge,
  Button,
  FormField,
  TextInput,
  TextArea,
  Panel,
} from "@/components/ui";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function ManageServicePage() {
  const router = useRouter();
  const {
    isLoggedIn,
    sessionReady,
    directoryProfiles,
    directoryProfilesReady,
    updateDirectoryProfile,
    userProfile,
    userEmail,
  } = useApp();

  const myProfile = useMemo(() => {
    return directoryProfiles.find(
      (p) =>
        isServiceDirectoryCategory(p.category) &&
        (p.userId === userProfile?.id ||
          p.email.toLowerCase() === (userEmail || "").toLowerCase())
    );
  }, [directoryProfiles, userProfile?.id, userEmail]);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [offerings, setOfferings] = useState("");
  const [regId, setRegId] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [verification, setVerification] = useState<ServiceVerification | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/services/manage")}`);
    }
  }, [sessionReady, isLoggedIn, router]);

  useEffect(() => {
    if (!myProfile) return;
    setDescription(myProfile.description || "");
    setAddress(myProfile.address || "");
    setMobile(myProfile.mobile || "");
    setWebsite(myProfile.website || "");
    setOfferings((myProfile.servicesOffered ?? []).join(", "));
  }, [myProfile]);

  useEffect(() => {
    if (!myProfile) return;
    void (async () => {
      try {
        const [v, b] = await Promise.all([
          servicePlatformService.getMyVerification(),
          servicePlatformService.listOwnerBookings(myProfile.id),
        ]);
        setVerification(v);
        setBookings(b.items);
        if (v?.businessRegistrationId) setRegId(v.businessRegistrationId);
      } catch {
        /* ignore */
      }
    })();
  }, [myProfile]);

  const saveProfile = async () => {
    if (!myProfile || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateDirectoryProfile(myProfile.id, {
        description,
        address,
        mobile,
        website,
        servicesOffered: offerings
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  };

  const submitVerification = async () => {
    if (!myProfile || busy) return;
    setBusy(true);
    setError(null);
    try {
      const v = await servicePlatformService.submitVerification({
        businessRegistrationId: regId || null,
        ownerNotes,
      });
      setVerification(v);
      setMessage("Verification submitted for admin review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit verification");
    } finally {
      setBusy(false);
    }
  };

  const updateBookingStatus = async (
    id: string,
    status: ServiceBooking["status"]
  ) => {
    try {
      const updated = await servicePlatformService.updateBooking(id, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update booking");
    }
  };

  if (!sessionReady || !directoryProfilesReady) {
    return (
      <div className="container mx-auto px-6 py-20 text-sm font-semibold text-charcoal/50">
        Loading…
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-lg text-center space-y-4">
        <h1 className="font-serif font-black text-2xl text-indigo">No service profile yet</h1>
        <p className="text-sm text-charcoal/60 font-semibold">
          Register your firm to manage bookings and verification from here.
        </p>
        <Link
          href="/services/register"
          className="inline-flex px-5 py-3 rounded-xl bg-terracotta text-white text-sm font-bold"
        >
          List your business
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-4xl pb-24 pt-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-3xl text-indigo">{myProfile.firmName}</h1>
          <p className="text-xs font-bold text-charcoal/50 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {myProfile.category} · {myProfile.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            tone={
              myProfile.verificationStatus === "verified"
                ? "success"
                : myProfile.verificationStatus === "pending"
                  ? "warning"
                  : "neutral"
            }
          >
            {myProfile.verificationStatus ?? "unverified"}
          </Badge>
          <Link
            href={`/services/${myProfile.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo hover:text-terracotta"
          >
            Public profile <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {message ? <Alert variant="success" title="Saved" description={message} /> : null}
      {error ? <Alert variant="danger" title="Error" description={error} /> : null}

      <Panel className="p-6 space-y-4">
        <h2 className="font-serif font-black text-lg text-indigo">Profile details</h2>
        <FormField label="Description">
          <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label="Address">
          <TextInput value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Mobile">
            <TextInput value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </FormField>
          <FormField label="Website">
            <TextInput value={website} onChange={(e) => setWebsite(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Services offered (comma-separated)">
          <TextInput value={offerings} onChange={(e) => setOfferings(e.target.value)} />
        </FormField>
        <Button type="button" loading={busy} onClick={() => void saveProfile()}>
          Save profile
        </Button>
      </Panel>

      <Panel className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-terracotta" />
          <h2 className="font-serif font-black text-lg text-indigo">Verification</h2>
        </div>
        <p className="text-xs text-charcoal/60 font-semibold">
          Status: {verification?.status ?? myProfile.verificationStatus ?? "unverified"}
          {verification?.rejectionReason
            ? ` — Rejected: ${verification.rejectionReason}`
            : ""}
        </p>
        <FormField label="Business registration / GST ID">
          <TextInput value={regId} onChange={(e) => setRegId(e.target.value)} />
        </FormField>
        <FormField label="Notes for admin">
          <TextArea rows={2} value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} />
        </FormField>
        <Button
          type="button"
          variant="outline"
          loading={busy}
          disabled={verification?.status === "approved"}
          onClick={() => void submitVerification()}
        >
          {verification?.status === "approved" ? "Verified" : "Submit for verification"}
        </Button>
      </Panel>

      <Panel className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo" />
          <h2 className="font-serif font-black text-lg text-indigo">Booking requests</h2>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-charcoal/50 font-semibold">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="border border-sand rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    {new Date(b.preferredAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-charcoal/60 mt-1">{b.contactPhone}</p>
                  {b.message ? (
                    <p className="text-xs text-charcoal/70 mt-1">{b.message}</p>
                  ) : null}
                  <Badge tone="neutral" className="mt-2">
                    {b.status}
                  </Badge>
                </div>
                {b.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void updateBookingStatus(b.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void updateBookingStatus(b.id, "cancelled")}
                    >
                      Decline
                    </Button>
                  </div>
                ) : b.status === "confirmed" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void updateBookingStatus(b.id, "completed")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Complete
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
