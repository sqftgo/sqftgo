"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
import { servicePlatformService } from "@/services";
import type {
  ServiceBooking,
  ServicePortfolioImage,
  ServiceVerification,
  ServiceWebsitePromotion,
  ServiceWebsitePromotionPayment,
  ServiceWebsitePromotionPlan,
} from "@/types";
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
  Crown,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { openRazorpayCheckout } from "@/lib/razorpay/checkout";
import { serviceProfilePath } from "@/lib/services/public-profile-path";
import { useAuth } from "@/hooks/useAuth";

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

  const { userName, userEmail: authEmail } = useAuth();
  const [description, setDescription] = useState("");
  const [intro, setIntro] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [offerings, setOfferings] = useState("");
  const [experience, setExperience] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioCaption, setPortfolioCaption] = useState("");
  const [portfolio, setPortfolio] = useState<ServicePortfolioImage[]>([]);
  const [regId, setRegId] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [verification, setVerification] = useState<ServiceVerification | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [promo, setPromo] = useState<ServiceWebsitePromotion | null>(null);
  const [promoPlans, setPromoPlans] = useState<ServiceWebsitePromotionPlan[]>([]);
  const [promoPayments, setPromoPayments] = useState<ServiceWebsitePromotionPayment[]>([]);
  const [promoWebsite, setPromoWebsite] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
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
    setIntro(myProfile.intro || "");
    setAddress(myProfile.address || "");
    setMobile(myProfile.mobile || "");
    setOfferings((myProfile.servicesOffered ?? []).join(", "));
    setExperience(myProfile.experience || "");
    setLogoUrl(myProfile.logoUrl || "");
    setCoverImageUrl(myProfile.coverImageUrl || "");
    setPromoWebsite(myProfile.website || "");
  }, [myProfile]);

  useEffect(() => {
    if (!myProfile) return;
    void (async () => {
      try {
        const [v, b, port, website] = await Promise.all([
          servicePlatformService.getMyVerification(),
          servicePlatformService.listOwnerBookings(myProfile.id),
          servicePlatformService.listPortfolio(myProfile.id),
          servicePlatformService.getWebsitePromotion(),
        ]);
        setVerification(v);
        setBookings(b.items);
        setPortfolio(port.items);
        setPromo(website.promotion);
        setPromoPlans(website.plans);
        setPromoPayments(website.payments);
        setPromoWebsite(website.promotion?.websiteUrl || website.profileWebsite || "");
        setSelectedPlanId((prev) => prev || website.plans[0]?.id || "");
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
        intro,
        address,
        mobile,
        experience: experience || undefined,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
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

  const purchaseWebsitePromo = async () => {
    if (!myProfile || !selectedPlanId || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const order = await servicePlatformService.createWebsitePromotionOrder({
        planId: selectedPlanId,
        websiteUrl: promoWebsite || undefined,
      });
      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SqftGo",
        description: order.plan.name,
        order_id: order.orderId,
        prefill: {
          name: userName || myProfile.ownerName,
          email: authEmail || myProfile.email,
          contact: myProfile.mobile,
        },
        notes: { purpose: "service_website_promotion" },
        theme: { color: "#2D375F" },
        handler: async (response) => {
          try {
            const verified = await servicePlatformService.verifyWebsitePromotionPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setPromo(verified.promotion);
            setMessage("Premium Website Promotion activated.");
            const refreshed = await servicePlatformService.getWebsitePromotion();
            setPromoPayments(refreshed.payments);
            setPromo(refreshed.promotion);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setBusy(false);
    }
  };

  const savePromoWebsite = async () => {
    if (!myProfile || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await servicePlatformService.updateWebsitePromotionUrl(promoWebsite);
      setPromo(res.promotion);
      setMessage("Website URL updated on your public profile.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update website");
    } finally {
      setBusy(false);
    }
  };

  const addPortfolio = async () => {
    if (!myProfile || !portfolioUrl.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const img = await servicePlatformService.addPortfolioImage(myProfile.id, {
        imageUrl: portfolioUrl.trim(),
        caption: portfolioCaption,
      });
      setPortfolio((prev) => [...prev, img]);
      setPortfolioUrl("");
      setPortfolioCaption("");
      setMessage("Portfolio image added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add image");
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
            href={serviceProfilePath(myProfile)}
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
        <FormField label="Short introduction">
          <TextInput
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="One-line pitch shown near the top of your profile"
          />
        </FormField>
        <FormField label="Business description">
          <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label="Address">
          <TextInput value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Mobile">
            <TextInput value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </FormField>
          <FormField label="Years of experience">
            <TextInput
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 12 years"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Logo image URL">
            <TextInput value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </FormField>
          <FormField label="Cover / banner image URL">
            <TextInput value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
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
          <Crown className="w-5 h-5 text-amber-600" />
          <h2 className="font-serif font-black text-lg text-indigo">Premium Website Promotion</h2>
        </div>
        <p className="text-xs font-semibold text-charcoal/60 leading-relaxed">
          Free profiles do not show a clickable external website link. Purchase Premium Website
          Promotion to display a Visit Website button on your public profile. Pricing is managed by
          SqftGo admins.
        </p>
        {promo?.isActive ? (
          <Alert
            variant="success"
            title="Premium active"
            description={`Valid until ${
              promo.expiresAt
                ? new Date(promo.expiresAt).toLocaleDateString("en-IN")
                : "further notice"
            }`}
          />
        ) : (
          <Alert
            variant="warning"
            title="Not active"
            description="Your website link is hidden from customers until you activate a plan."
          />
        )}
        <FormField label="Official website URL">
          <TextInput
            value={promoWebsite}
            onChange={(e) => setPromoWebsite(e.target.value)}
            placeholder="https://www.yourbusiness.com"
          />
        </FormField>
        {promo?.isActive ? (
          <Button type="button" loading={busy} onClick={() => void savePromoWebsite()}>
            Update website URL
          </Button>
        ) : (
          <div className="space-y-3">
            <FormField label="Choose a plan">
              <select
                className="w-full rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm font-semibold"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                {promoPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{(p.pricePaise / 100).toFixed(0)} · {p.durationDays} days ·{" "}
                    {p.billingType === "recurring" ? "recurring" : "one-time"}
                  </option>
                ))}
              </select>
            </FormField>
            <Button type="button" loading={busy} onClick={() => void purchaseWebsitePromo()}>
              Pay & activate
            </Button>
          </div>
        )}
        {promoPayments.length > 0 ? (
          <div className="pt-2 border-t border-sand">
            <h3 className="text-xs font-black uppercase tracking-wider text-charcoal/40 mb-2">
              Payment history
            </h3>
            <ul className="space-y-1.5">
              {promoPayments.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="text-xs font-semibold text-charcoal/65 flex justify-between gap-2"
                >
                  <span>
                    {p.planName || "Plan"} · {p.status}
                  </span>
                  <span>
                    ₹{(p.amountPaise / 100).toFixed(0)}
                    {p.paidAt ? ` · ${new Date(p.paidAt).toLocaleDateString("en-IN")}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Panel>

      <Panel className="p-6 space-y-4">
        <h2 className="font-serif font-black text-lg text-indigo">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Image URL">
            <TextInput value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
          </FormField>
          <FormField label="Caption">
            <TextInput
              value={portfolioCaption}
              onChange={(e) => setPortfolioCaption(e.target.value)}
            />
          </FormField>
        </div>
        <Button type="button" variant="outline" loading={busy} onClick={() => void addPortfolio()}>
          Add portfolio image
        </Button>
        {portfolio.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {portfolio.map((img) => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt={img.caption} className="w-full h-24 object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-charcoal/50">No portfolio images yet.</p>
        )}
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
