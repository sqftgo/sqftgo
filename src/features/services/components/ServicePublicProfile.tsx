"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
import { servicePlatformService, dealerService } from "@/services";
import type {
  DirectoryProfile,
  ServicePortfolioImage,
  ServiceReview,
} from "@/types";
import {
  Alert,
  Button,
  FormField,
  TextInput,
  TextArea,
} from "@/components/ui";
import {
  ArrowLeft,
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

type Props = { profileKey: string };

export function ServicePublicProfile({ profileKey }: Props) {
  const router = useRouter();
  const { directoryProfiles, directoryProfilesReady, isLoggedIn, sessionReady, userProfile } =
    useApp();

  const cached = useMemo(() => {
    return (
      directoryProfiles.find((p) => p.id === profileKey || p.slug === profileKey) ?? null
    );
  }, [directoryProfiles, profileKey]);

  const [profile, setProfile] = useState<DirectoryProfile | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [websitePromoActive, setWebsitePromoActive] = useState(false);
  const [portfolio, setPortfolio] = useState<ServicePortfolioImage[]>([]);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  const [preferredAt, setPreferredAt] = useState("");
  const [contactPhone, setContactPhone] = useState(userProfile?.phone || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.phone) setContactPhone(userProfile.phone);
  }, [userProfile?.phone]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cached) {
        setProfile(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setLoadError(null);
      try {
        const fetched = await dealerService.getById(profileKey);
        if (cancelled) return;
        if (fetched && isServiceDirectoryCategory(fetched.category)) {
          setProfile(fetched);
        } else if (!cached) {
          setProfile(null);
          setLoadError("not_found");
        }
      } catch (err) {
        if (cancelled) return;
        if (!cached) {
          setLoadError(err instanceof Error ? err.message : "Unable to load service profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileKey, cached]);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [rev, port] = await Promise.all([
          servicePlatformService.listReviews(profile.id),
          servicePlatformService.listPortfolio(profile.id),
        ]);
        if (cancelled) return;
        setReviews(rev.items);
        setAvgRating(rev.averageRating);
        setReviewCount(rev.reviewCount);
        setPortfolio(port.items);
      } catch {
        /* ignore enrichment failures */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/services/${encodeURIComponent(profile.id)}/website-status`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { active?: boolean };
        if (!cancelled) setWebsitePromoActive(Boolean(data.active));
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/services/${profileKey}`)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await servicePlatformService.createBooking(profile.id, {
        preferredAt: new Date(preferredAt).toISOString(),
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isLoggedIn) return;
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      const created = await servicePlatformService.submitReview(profile.id, {
        rating: reviewRating,
        body: reviewBody,
      });
      setReviews((prev) => {
        const without = prev.filter((r) => r.userId !== created.userId);
        return [created, ...without];
      });
      setReviewBody("");
      setReviewMsg("Thanks — your review is live.");
      const refreshed = await servicePlatformService.listReviews(profile.id);
      setAvgRating(refreshed.averageRating);
      setReviewCount(refreshed.reviewCount);
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : "Unable to submit review");
    } finally {
      setReviewBusy(false);
    }
  };

  if (loading || (!profile && !directoryProfilesReady && !loadError)) {
    return (
      <main className="min-h-screen bg-cream pt-32 flex flex-col items-center justify-center">
        <p className="text-charcoal/60 font-semibold">Loading service profile…</p>
      </main>
    );
  }

  if (loadError && loadError !== "not_found" && !profile) {
    return (
      <main className="min-h-screen bg-cream pt-32 flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-serif font-black text-charcoal mb-4">Unable to load profile</h1>
        <p className="text-charcoal/60 mb-8 text-center max-w-md">{loadError}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-indigo text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </main>
    );
  }

  if (!profile || !isServiceDirectoryCategory(profile.category)) {
    return (
      <main className="min-h-screen bg-cream pt-32 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-black text-charcoal mb-4">Profile Not Found</h1>
        <p className="text-charcoal/60 mb-8">
          The service profile you are looking for does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-indigo text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </main>
    );
  }

  const initials = profile.firmName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const mailto = profile.email
    ? `mailto:${profile.email}?subject=${encodeURIComponent(`Inquiry for ${profile.firmName}`)}`
    : null;
  const tel = profile.mobile ? `tel:${profile.mobile.replace(/\s/g, "")}` : null;
  const websiteUrl =
    websitePromoActive && profile.website?.trim()
      ? profile.website.startsWith("http")
        ? profile.website
        : `https://${profile.website}`
      : null;
  const intro = profile.intro?.trim();
  const description = profile.description?.trim();
  const social = profile.socialLinks ?? {};
  const mapQuery = `${profile.address}, ${profile.city}, India`;

  return (
    <main className="min-h-screen bg-cream pt-24 pb-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-6 text-left">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-black text-charcoal/65 hover:text-indigo group transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>BACK TO SERVICES</span>
          </Link>
        </div>

        {/* Cover Banner — same shell as dealers */}
        <div className="relative h-48 md:h-64 w-full rounded-[2rem] overflow-hidden border border-sand/40 shadow-inner bg-slate-900">
          {profile.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverImageUrl}
              alt={profile.firmName}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo via-indigo-hover to-charcoal">
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#faf8f5_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Profile header overlapping banner */}
        <div className="relative px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start justify-between z-10 border-b border-sand/55 mb-8">
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start w-full">
            <div className="-mt-12 md:-mt-16 shrink-0 z-20">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-serif text-3xl md:text-4xl font-black shrink-0 relative overflow-hidden group">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logoUrl}
                    alt={profile.firmName}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo text-white flex items-center justify-center">
                    <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1.5px]">
                      <Briefcase className="w-8 h-8 md:w-9 md:h-9 text-white" />
                    </div>
                    <span>{initials}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-left mt-2 md:mt-0 pt-3 md:pt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-indigo/5 text-indigo border border-indigo/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  {profile.category}
                </span>
                {profile.verificationStatus === "verified" ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified business</span>
                  </span>
                ) : null}
                {websitePromoActive ? (
                  <span className="bg-amber-500/10 border border-amber-500/25 text-amber-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    Premium Business
                  </span>
                ) : null}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-indigo leading-tight mb-2">
                {profile.firmName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-charcoal/70 text-sm font-semibold">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-terracotta shrink-0" />
                  <span>
                    Principal: <strong className="text-indigo font-bold">{profile.ownerName}</strong>
                  </span>
                </span>
                <span className="text-sand hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                  <span>
                    {profile.city}, Bharat
                  </span>
                </span>
                {avgRating != null && reviewCount > 0 ? (
                  <>
                    <span className="text-sand hidden sm:inline">|</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span>
                        {avgRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
              <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">
                About the Business
              </h3>
              <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line font-medium mt-4">
                {intro || description || "This business has not added a description yet."}
              </p>
              {intro && description && description !== intro ? (
                <p className="text-charcoal/70 text-sm leading-relaxed whitespace-pre-line font-medium mt-4">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 text-left">
              <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">
                Business Credentials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/5 border border-terracotta/10 text-terracotta flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                      Experience
                    </span>
                    <span className="text-xs font-black text-charcoal mt-0.5">
                      {profile.experience || "—"}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                      Services
                    </span>
                    <span className="text-xs font-black text-charcoal mt-0.5">
                      {(profile.servicesOffered?.length ?? 0) || "—"} listed
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                      Rating
                    </span>
                    <span className="text-xs font-black text-charcoal mt-0.5">
                      {avgRating != null && reviewCount > 0
                        ? `${avgRating.toFixed(1)} / 5`
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                      SqftGo Vetted
                    </span>
                    <span className="text-xs font-black text-charcoal mt-0.5">
                      {profile.verificationStatus === "verified"
                        ? "Verified business"
                        : "Directory listing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {profile.servicesOffered && profile.servicesOffered.length > 0 ? (
              <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">
                  Services Offered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {profile.servicesOffered.map((service) => (
                    <div
                      key={service}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-cream border border-sand/80 text-charcoal/90 text-xs font-bold hover:border-indigo/25 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {portfolio.length > 0 ? (
              <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">
                  Portfolio
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {portfolio.map((img) => (
                    <figure
                      key={img.id}
                      className="rounded-2xl overflow-hidden border border-sand bg-cream"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={img.caption || "Portfolio work"}
                        className="w-full h-28 object-cover"
                      />
                      {img.caption ? (
                        <figcaption className="px-2 py-1.5 text-[11px] font-semibold text-charcoal/60 truncate">
                          {img.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left space-y-4">
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-sand/40">
                <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">
                  Customer Reviews
                </h3>
                {avgRating != null ? (
                  <span className="text-xs font-black text-charcoal/70">
                    {avgRating.toFixed(1)} / 5
                  </span>
                ) : null}
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm font-semibold text-charcoal/50">No reviews yet.</p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-t border-sand/60 pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2 text-amber-500 mb-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                        <span className="text-xs font-bold text-charcoal/50 ml-1">
                          {r.reviewerName || "Customer"}
                        </span>
                      </div>
                      {r.title ? (
                        <p className="text-sm font-black text-charcoal">{r.title}</p>
                      ) : null}
                      <p className="text-sm font-semibold text-charcoal/70 leading-relaxed">
                        {r.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {sessionReady && isLoggedIn ? (
                <form onSubmit={submitReview} className="pt-4 border-t border-sand/60 space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-charcoal/40">
                    Write a review
                  </h4>
                  {reviewMsg ? (
                    <Alert
                      variant={reviewMsg.startsWith("Thanks") ? "success" : "danger"}
                      title={reviewMsg.startsWith("Thanks") ? "Saved" : "Error"}
                      description={reviewMsg}
                    />
                  ) : null}
                  <FormField label="Rating">
                    <select
                      className="w-full rounded-xl border border-sand bg-cream px-3 py-2 text-sm font-semibold"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Your experience">
                    <TextArea
                      rows={3}
                      required
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="What stood out about working with this business?"
                    />
                  </FormField>
                  <Button type="submit" loading={reviewBusy} variant="secondary">
                    Submit review
                  </Button>
                </form>
              ) : (
                <p className="text-xs font-semibold text-charcoal/50">
                  <Link
                    href={`/login?next=${encodeURIComponent(`/services/${profileKey}`)}`}
                    className="text-terracotta font-black"
                  >
                    Sign in
                  </Link>{" "}
                  to leave a review.
                </p>
              )}
            </div>
          </div>

          {/* Right sticky sidebar — dealer contact console pattern */}
          <div className="lg:col-span-5 w-full sticky lg:top-28">
            <div className="w-full rounded-3xl bg-cream border border-sand shadow-md flex flex-col relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none" />

              <div className="p-6 pb-5 flex flex-col gap-4 border-b border-sand/65 relative z-10">
                <h3 className="font-serif font-black text-lg text-indigo mb-1">Business Contacts</h3>
                <div className="w-10 h-0.5 bg-terracotta rounded-full mb-2" />

                <div className="flex flex-col gap-4 text-xs font-semibold text-charcoal/80">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0">
                      <MapPin className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                        Business Address
                      </span>
                      <span className="text-charcoal leading-snug mt-0.5 font-medium">
                        {profile.address}
                      </span>
                    </div>
                  </div>

                  {tel ? (
                    <a href={tel} className="flex items-center gap-3.5 group cursor-pointer">
                      <div className="w-8.5 h-8.5 rounded-xl bg-terracotta/5 border border-terracotta/10 flex items-center justify-center text-terracotta shrink-0 transition-transform group-hover:scale-105">
                        <Phone className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                          Mobile Phone
                        </span>
                        <span className="text-charcoal group-hover:text-terracotta transition-colors mt-0.5">
                          {profile.mobile}
                        </span>
                      </div>
                    </a>
                  ) : null}

                  {mailto ? (
                    <a href={mailto} className="flex items-center gap-3.5 group overflow-hidden cursor-pointer">
                      <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0 transition-transform group-hover:scale-105">
                        <Mail className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                          Email Address
                        </span>
                        <span className="text-charcoal group-hover:text-indigo transition-colors truncate mt-0.5">
                          {profile.email}
                        </span>
                      </div>
                    </a>
                  ) : null}

                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 group cursor-pointer"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 transition-transform group-hover:scale-105">
                        <Globe className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                          Official Website · Premium
                        </span>
                        <span className="text-charcoal group-hover:text-amber-800 transition-colors mt-0.5 inline-flex items-center gap-1">
                          Visit website <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </a>
                  ) : null}

                  {profile.businessHours ? (
                    <div className="flex items-start gap-3.5 pt-2 border-t border-sand/60">
                      <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                        <Clock className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col text-left w-full">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                          Working Hours
                        </span>
                        <div className="text-charcoal leading-snug mt-1 text-[11px] font-semibold space-y-1">
                          {typeof profile.businessHours === "object" ? (
                            Object.entries(profile.businessHours).map(([key, val]) => (
                              <div key={key} className="flex justify-between items-center text-[11px]">
                                <span className="capitalize text-charcoal/60">{key}:</span>
                                <span className="text-charcoal font-bold">{val}</span>
                              </div>
                            ))
                          ) : (
                            <span>{String(profile.businessHours)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {Object.values(social).some(Boolean) ? (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-sand/60">
                      {social.instagram ? (
                        <a
                          href={social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black text-indigo"
                        >
                          Instagram
                        </a>
                      ) : null}
                      {social.facebook ? (
                        <a
                          href={social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black text-indigo"
                        >
                          Facebook
                        </a>
                      ) : null}
                      {social.linkedin ? (
                        <a
                          href={social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black text-indigo"
                        >
                          LinkedIn
                        </a>
                      ) : null}
                      {social.youtube ? (
                        <a
                          href={social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black text-indigo"
                        >
                          YouTube
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div id="book" className="p-6 relative z-10 text-left space-y-4">
                <h3 className="font-serif font-black text-lg text-indigo mb-1">Book / Enquire</h3>
                <p className="text-xs text-charcoal/50 mb-1">
                  Request a preferred time. The provider confirms from their dashboard.
                  {sessionReady && !isLoggedIn ? " Sign in required." : ""}
                </p>

                {success ? (
                  <Alert
                    variant="success"
                    title="Request sent"
                    description="Track it under Service Bookings in your menu."
                  />
                ) : null}
                {error ? <Alert variant="danger" title="Error" description={error} /> : null}

                <form onSubmit={submitBooking} className="space-y-3">
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

                <div className="flex flex-col gap-2 pt-2">
                  {tel ? (
                    <a
                      href={tel}
                      className="w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                    >
                      <Phone className="w-4 h-4" />
                      Call {profile.mobile}
                    </a>
                  ) : null}
                  {mailto ? (
                    <a
                      href={mailto}
                      className="w-full py-3 bg-indigo hover:bg-indigo/90 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                    >
                      <Mail className="w-4 h-4" />
                      Email {profile.email}
                    </a>
                  ) : null}
                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white border border-sand hover:border-amber-500/40 text-charcoal font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                    >
                      <Globe className="w-4 h-4 text-amber-700" />
                      Visit Website
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                  {!tel && !mailto ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] text-charcoal/80 leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>No phone or email published for this business.</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white border border-sand rounded-3xl overflow-hidden shadow-sm h-[240px]">
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
        </div>
      </div>
    </main>
  );
}
