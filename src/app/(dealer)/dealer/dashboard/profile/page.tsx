"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { DealerKycRecord, DirectoryProfile } from "@/types";
import { DealerKycPanel } from "@/features/kyc";
import { PropertyCard } from "@/features/properties";
import {
  Save,
  User,
  Globe,
  ShieldCheck,
  Building2,
  Award,
  ChevronRight,
  FileCheck,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Users,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Star,
  BadgeCheck,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";
import {
  DashboardPageHeader,
  Button,
  Alert,
  Panel,
  Badge,
  FormField,
  TextInput,
  TextArea,
  CustomSelect,
  GlobalLoading,
} from "@/components/ui";
import { findMyDirectoryProfile, filterMyProperties } from "@/lib/ownership";
import { subscriptionService } from "@/services/subscription";
import { listingPlanApi } from "@/services/listing-plans";
import type { SubscriptionOverview } from "@/types/billing";
import type { DealerListingQuotaView } from "@/types/listing-plan";
import { formatPlanPrice } from "@/features/billing/plans";
import { useActiveCities } from "@/hooks/useActiveCities";

const CATEGORIES = [
  "Agent & Broker",
  "Builder & Developer",
  "Interior Decorator",
  "Architect",
  "Building Contractor",
  "Property Consultant",
];

const SPECIALTIES = [
  "Heritage Havelis",
  "Lakefront Villas",
  "Agricultural Lands",
  "RERA Clearances",
  "Commercial Leases",
  "Title Checks",
  "Luxury Apartments",
  "Bungalows",
  "Plots & Land",
];

const SERVICES = [
  "Property Valuation",
  "Legal Documentation",
  "Home Loans",
  "Interior Design",
  "RERA Registration",
  "Title Verification",
  "Site Visits",
  "Investment Advisory",
];

const TABS = [
  { id: "Preview",      label: "Customer View",       icon: Eye },
  { id: "Personal",     label: "Personal Info",       icon: User },
  { id: "Business",     label: "Business & Branding", icon: Building2 },
  { id: "KYC",          label: "KYC & RERA",          icon: FileCheck },
  { id: "Services",     label: "Services & Hours",    icon: Globe },
  { id: "Subscription", label: "Subscription",        icon: Award },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function DealerProfilePage() {
  const { userEmail, userProfile, directoryProfiles, updateDirectoryProfile, properties } = useApp();
  const { cityOptionsWithoutAll, locationsReady } = useActiveCities();
  const profile = findMyDirectoryProfile(directoryProfiles, userProfile?.id, userEmail);
  const myProperties = filterMyProperties(properties, userProfile?.id, userEmail);
  const activeListings = myProperties.filter((p) => p.status === "Active");

  const [activeTab, setActiveTab] = useState("Personal");
  const [saved, setSaved] = useState(false);
  const [kyc, setKyc] = useState<DealerKycRecord | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Subscription state
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [quota, setQuota] = useState<DealerListingQuotaView | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  const loadSub = useCallback(async () => {
    setSubLoading(true);
    try {
      const [data, q] = await Promise.all([
        subscriptionService.getOverview(),
        listingPlanApi.getQuota().catch(() => null),
      ]);
      setOverview(data);
      setQuota(q);
    } catch { /* silently ignore */ }
    finally { setSubLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "Subscription") void loadSub();
  }, [activeTab, loadSub]);

  const [form, setForm] = useState({
    firmName:        profile?.firmName        || "",
    ownerName:       profile?.ownerName       || "",
    category:        profile?.category        || "Agent & Broker",
    city:            profile?.city            || "",
    address:         profile?.address         || "",
    mobile:          profile?.mobile          || "",
    email:           profile?.email           || userEmail || "",
    website:         profile?.website         || "",
    reraId:          profile?.reraId          || "",
    description:     profile?.description     || "",
    specialties:     profile?.specialties     || [] as string[],
    experience:      profile?.experience      || "",
    teamSize:        profile?.teamSize?.toString() || "",
    servicesOffered: profile?.servicesOffered || [] as string[],
    coverImageUrl:   profile?.coverImageUrl   || "",
    logoUrl:         profile?.logoUrl         || "",
    hoursWeekdays:   profile?.businessHours?.weekdays || "9:30 AM – 7:30 PM",
    hoursSaturday:   profile?.businessHours?.saturday || "10:00 AM – 6:00 PM",
    hoursSunday:     profile?.businessHours?.sunday   || "Closed / By Appointment",
    listingActive:   profile?.listingActive   ?? true,
  });

  // Sync profile if loaded asynchronously
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        firmName:        prev.firmName || profile.firmName || "",
        ownerName:       prev.ownerName || profile.ownerName || "",
        category:        prev.category !== "Agent & Broker" ? prev.category : profile.category || "Agent & Broker",
        city:            prev.city || profile.city || "",
        address:         prev.address || profile.address || "",
        mobile:          prev.mobile || profile.mobile || "",
        email:           prev.email || profile.email || userEmail || "",
        website:         prev.website || profile.website || "",
        reraId:          prev.reraId || profile.reraId || "",
        description:     prev.description || profile.description || "",
        specialties:     prev.specialties.length > 0 ? prev.specialties : profile.specialties || [],
        experience:      prev.experience || profile.experience || "",
        teamSize:        prev.teamSize || profile.teamSize?.toString() || "",
        servicesOffered: prev.servicesOffered.length > 0 ? prev.servicesOffered : profile.servicesOffered || [],
        coverImageUrl:   prev.coverImageUrl || profile.coverImageUrl || "",
        logoUrl:         prev.logoUrl || profile.logoUrl || "",
        hoursWeekdays:   prev.hoursWeekdays || profile.businessHours?.weekdays || "9:30 AM – 7:30 PM",
        hoursSaturday:   prev.hoursSaturday || profile.businessHours?.saturday || "10:00 AM – 6:00 PM",
        hoursSunday:     prev.hoursSunday || profile.businessHours?.sunday || "Closed / By Appointment",
        listingActive:   prev.listingActive ?? profile.listingActive ?? true,
      }));
    }
  }, [profile, userEmail]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSpec = (s: string) => {
    set("specialties", form.specialties.includes(s)
      ? form.specialties.filter((x: string) => x !== s)
      : [...form.specialties, s]);
  };

  const toggleService = (s: string) => {
    set("servicesOffered", form.servicesOffered.includes(s)
      ? form.servicesOffered.filter((x: string) => x !== s)
      : [...form.servicesOffered, s]);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!profile?.id) return;
    setSaveError(null);
    try {
      await updateDirectoryProfile(profile.id, {
        firmName:        form.firmName,
        ownerName:       form.ownerName,
        category:        form.category as DirectoryProfile["category"],
        city:            form.city,
        address:         form.address,
        mobile:          form.mobile,
        email:           form.email,
        website:         form.website,
        reraId:          form.reraId || undefined,
        description:     form.description,
        specialties:     form.specialties,
        experience:      form.experience || undefined,
        teamSize:        form.teamSize ? parseInt(form.teamSize) : undefined,
        servicesOffered: form.servicesOffered,
        coverImageUrl:   form.coverImageUrl.trim() || null,
        logoUrl:         form.logoUrl.trim() || null,
        businessHours: {
          weekdays: form.hoursWeekdays,
          saturday: form.hoursSaturday,
          sunday:   form.hoursSunday,
        },
        listingActive:   form.listingActive,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save profile");
    }
  };

  const inputClass = "focus:border-indigo/40 focus:ring-indigo/10";

  const subStatus = overview?.subscription?.status;
  const subStatusConfig = {
    active:   { tone: "success" as const, icon: CheckCircle2, label: "Active" },
    pending:  { tone: "warning" as const, icon: Clock,         label: "Pending" },
    past_due: { tone: "danger"  as const, icon: AlertCircle,   label: "Past Due" },
    expired:  { tone: "danger"  as const, icon: AlertCircle,   label: "Expired" },
    inactive: { tone: "neutral" as const, icon: CreditCard,    label: "No Plan" },
    cancelled:{ tone: "neutral" as const, icon: CreditCard,    label: "Cancelled" },
  };
  const subConfig = subStatusConfig[subStatus as keyof typeof subStatusConfig] ?? subStatusConfig.inactive;

  const initials = (form.firmName || form.ownerName || "Dealer")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const publicUrl = profile?.id ? `/dealers/${profile.id}` : null;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Dealer Profile"
        description="Manage your verified directory storefront, branding, and customer-facing presence."
        className="rounded-3xl"
        actions={
          <div className="flex items-center gap-2">
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo hover:text-indigo/80 bg-white border border-indigo/20 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Public Page</span>
                <span className="sm:hidden">Public</span>
              </a>
            )}
            <Button
              type="button"
              variant={activeTab === "Preview" ? "outline" : "ghost"}
              size="md"
              onClick={() => setActiveTab(activeTab === "Preview" ? "Personal" : "Preview")}
            >
              {activeTab === "Preview" ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{activeTab === "Preview" ? "Edit Mode" : "Customer View"}</span>
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleSave()} size="md">
              <Save className="w-4 h-4" /> Save Profile
            </Button>
          </div>
        }
      />

      {/* ── Public Layout Hero Showcase (Mirrors Normal Customer View Header) ── */}
      <div className="relative rounded-[2rem] overflow-hidden border border-sand shadow-sm bg-white">
        {/* Cover Banner */}
        <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden bg-slate-900">
          {form.coverImageUrl ? (
            <img
              src={form.coverImageUrl}
              alt={form.firmName || "Cover"}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo via-indigo-hover to-charcoal relative">
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#faf8f5_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          
          {/* Quick edit banner chip */}
          <button
            type="button"
            onClick={() => setActiveTab("Business")}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Change Banner</span>
          </button>
        </div>

        {/* Profile Card Info (Overlaps Banner) */}
        <div className="relative px-6 md:px-8 pb-6 pt-0 flex flex-col md:flex-row gap-5 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start w-full">
            {/* Logo / Initials Badge */}
            <div className="-mt-12 sm:-mt-16 shrink-0 z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-serif text-2xl sm:text-3xl font-black shrink-0 relative overflow-hidden group">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.firmName}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo text-white flex items-center justify-center">
                    <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1.5px]">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <span>{initials}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Titles & Badges */}
            <div className="flex-1 text-left pt-2 sm:pt-4">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-indigo/5 text-indigo border border-indigo/10 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  {form.category}
                </span>
                {kyc?.status === "approved" ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> KYC Verified
                  </span>
                ) : form.reraId ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> RERA ID: {form.reraId}
                  </span>
                ) : null}
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                  form.listingActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {form.listingActive ? "Publicly Listed" : "Directory Hidden"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-black text-indigo leading-tight mb-1">
                {form.firmName || "Firm Name Not Set"}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-charcoal/70 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span>Principal: <strong className="text-indigo font-bold">{form.ownerName || "Representative"}</strong></span>
                </span>
                <span className="text-sand hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span>{form.city || "Rajasthan"}, Rajasthan</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-4 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-sand/40">
            {[
              { label: "Active Listings", value: activeListings.length },
              { label: "Experience",      value: form.experience || "5+ Yrs" },
              { label: "Team Size",       value: form.teamSize ? `${form.teamSize} Experts` : "2 Experts" },
            ].map(({ label, value }) => (
              <div key={label} className="px-3.5 py-2 bg-sand/30 rounded-2xl border border-indigo/5 text-center min-w-[70px]">
                <span className="block text-base sm:text-lg font-serif font-black text-indigo leading-none mb-0.5">{value}</span>
                <span className="text-[8px] font-black text-charcoal/45 uppercase tracking-widest leading-none">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {saveError && (
        <Alert variant="danger" title="Could not save profile" description={saveError} onDismiss={() => setSaveError(null)} />
      )}
      {saved && (
        <Alert variant="success" title="Profile updated" description="All changes are now synchronized with your public directory showcase." onDismiss={() => setSaved(false)} />
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-indigo text-white shadow-sm"
                  : "bg-white border border-sand text-charcoal/70 hover:border-indigo/30 hover:text-indigo"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-charcoal/50"}`} />
              <span>{tab.label}</span>
              {tab.id === "Preview" && (
                <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-black uppercase tracking-wider">
                  Live
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "Preview" ? (
        /* ══════════════════════════════════════════════════════════════════
           LIVE CUSTOMER VIEW (EXACT MIRROR OF /dealers/[id] FOR ACCURACY)
        ══════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo/5 border border-indigo/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
              <Eye className="w-4 h-4 text-indigo shrink-0" />
              <span>
                <strong>Accurate Customer View:</strong> This showcases the exact layout normal customers see when viewing your broker profile.
              </span>
            </div>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo hover:text-indigo-hover underline shrink-0"
              >
                <span>Open in customer tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="bg-cream rounded-[2.5rem] border border-sand p-4 sm:p-8 space-y-8 shadow-sm">
            {/* Main Content Grid: Information & Sticky Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Description, Specs stats, Specialties, Services */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* Description card */}
                <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                  <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">About the Firm</h3>
                  <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line font-medium mt-4">
                    {form.description || "No description provided yet. Add your professional summary in the Business & Branding tab."}
                  </p>
                </div>

                {/* Trust Metrics Dashboard Grid */}
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Firm Credentials</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Stat 1: Experience */}
                    <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-terracotta/5 border border-terracotta/10 text-terracotta flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Experience</span>
                        <span className="text-xs font-black text-charcoal mt-0.5">{form.experience || "5+ Years"}</span>
                      </div>
                    </div>

                    {/* Stat 2: Active Deals */}
                    <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Active Deals</span>
                        <span className="text-xs font-black text-charcoal mt-0.5">{activeListings.length} Listings</span>
                      </div>
                    </div>

                    {/* Stat 3: Team Size */}
                    <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Team Size</span>
                        <span className="text-xs font-black text-charcoal mt-0.5">{form.teamSize ? `${form.teamSize} Experts` : "2 Experts"}</span>
                      </div>
                    </div>

                    {/* Stat 4: Vetting Clearance */}
                    <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">SqftGo Vetted</span>
                        <span className="text-xs font-black text-charcoal mt-0.5">{form.reraId ? "RERA listed" : "Directory listing"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialties & Core Focus */}
                {form.specialties && form.specialties.length > 0 && (
                  <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                    <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">Specialties & Core Focus</h3>
                    <div className="flex flex-wrap gap-2.5 mt-4">
                      {form.specialties.map((spec) => (
                        <span key={spec} className="px-4 py-2.5 rounded-xl bg-cream border border-sand text-charcoal/90 text-xs font-bold hover:border-terracotta/25 transition-all">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Offered */}
                {form.servicesOffered && form.servicesOffered.length > 0 && (
                  <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                    <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">Services Offered</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {form.servicesOffered.map((service) => (
                        <div
                          key={service}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-cream border border-sand/80 text-charcoal/90 text-xs font-bold"
                        >
                          <div className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Unified Contacts & Message Sidebar Console */}
              <div className="lg:col-span-5 w-full sticky lg:top-28">
                <div className="w-full rounded-3xl bg-cream border border-sand shadow-md flex flex-col relative overflow-hidden text-left">
                  {/* Decorative background circle */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none" />

                  {/* Office Details */}
                  <div className="p-6 pb-5 flex flex-col gap-4 border-b border-sand/65 relative z-10">
                    <h3 className="font-serif font-black text-lg text-indigo mb-1">Office Contacts</h3>
                    <div className="w-10 h-0.5 bg-terracotta rounded-full mb-2" />
                    
                    <div className="flex flex-col gap-4 text-xs font-semibold text-charcoal/80">
                      {/* Address */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0">
                          <MapPin className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Office Address</span>
                          <span className="text-charcoal leading-snug mt-0.5 font-medium">{form.address || "Address not provided"}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-8.5 h-8.5 rounded-xl bg-terracotta/5 border border-terracotta/10 flex items-center justify-center text-terracotta shrink-0">
                          <Phone className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Mobile Phone</span>
                          <span className="text-charcoal font-bold mt-0.5">{form.mobile || "Not specified"}</span>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0">
                          <Mail className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Email Address</span>
                          <span className="text-charcoal font-bold truncate mt-0.5">{form.email || userEmail || "Not specified"}</span>
                        </div>
                      </div>

                      {/* Website */}
                      {form.website && (
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Globe className="w-4 h-4 shrink-0" />
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Website</span>
                            <span className="text-charcoal font-bold truncate mt-0.5">{form.website}</span>
                          </div>
                        </div>
                      )}

                      {/* Working Hours */}
                      <div className="flex items-start gap-3.5 pt-2 border-t border-sand/60">
                        <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                          <Clock className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col text-left w-full">
                          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Working Hours</span>
                          <div className="text-charcoal leading-snug mt-1 text-[11px] font-semibold space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="capitalize text-charcoal/60">Mon – Fri:</span>
                              <span className="text-charcoal font-bold">{form.hoursWeekdays}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="capitalize text-charcoal/60">Saturday:</span>
                              <span className="text-charcoal font-bold">{form.hoursSaturday}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="capitalize text-charcoal/60">Sunday:</span>
                              <span className="text-charcoal font-bold">{form.hoursSunday}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="p-6 relative z-10 text-left space-y-2">
                    <h3 className="font-serif font-black text-lg text-indigo mb-1">Contact this broker</h3>
                    <p className="text-xs text-charcoal/50 mb-3">Customer action buttons rendered on your live page:</p>
                    {form.mobile && (
                      <div className="w-full py-3 bg-terracotta text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                        <Phone className="w-4 h-4" />
                        Call {form.mobile}
                      </div>
                    )}
                    {form.email && (
                      <div className="w-full py-3 bg-indigo text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                        <Mail className="w-4 h-4" />
                        Email {form.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Properties Listed by Broker Section */}
            <div className="mt-16 pt-12 border-t border-sand text-left">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-black text-indigo">
                  Exclusive Listings by {form.firmName || "this Broker"}
                </h2>
                <p className="text-xs text-charcoal/50 font-black uppercase tracking-wider mt-1.5">
                  Verified active listings in {form.city || "Rajasthan"} under exclusive mandate
                </p>
              </div>

              {activeListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeListings.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-sand rounded-[2rem] p-12 text-center shadow-sm">
                  <Building2 className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
                  <p className="text-charcoal/60 font-semibold text-sm">No active listings published yet under this broker profile.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           EDIT PROFILE TABS
        ══════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSave}>
          <Panel padding="lg" rounded="3xl" className="md:p-8 space-y-6">

            {/* ── Personal Info ── */}
            {activeTab === "Personal" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Personal & Contact Information</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Your representative details visible in the public directory and on property listing cards.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Owner / Representative Name" required>
                    <TextInput
                      type="text"
                      required
                      value={form.ownerName}
                      onChange={(e) => set("ownerName", e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Contact Mobile" required>
                    <TextInput
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      placeholder="e.g. +91 98000 00000"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Public Contact Email" hint="Shown to customers for inquiries">
                    <TextInput
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="e.g. contact@yourfirm.com"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Years of Experience" hint="Shown under Firm Credentials on your page">
                    <TextInput
                      type="text"
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      placeholder="e.g. 8+ Years"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Account Login Email" hint="Your secure SqftGo account login" className="sm:col-span-2">
                    <TextInput
                      type="email"
                      disabled
                      value={userEmail || ""}
                      className="opacity-60 cursor-not-allowed"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* ── Business & Branding ── */}
            {activeTab === "Business" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Business Details & Visual Branding</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Customize your firm identity, imagery, and professional summary showcased to customers.
                  </p>
                </div>

                {/* Imagery & Branding Section */}
                <div className="p-5 rounded-2xl bg-sand/20 border border-indigo/10 space-y-4">
                  <h4 className="text-xs font-bold text-indigo uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Profile Media & Imagery
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Firm Logo */}
                    <div className="space-y-2">
                      <FormField label="Firm Logo Image URL" hint="Direct image link (square format recommended)">
                        <TextInput
                          type="url"
                          value={form.logoUrl}
                          onChange={(e) => set("logoUrl", e.target.value)}
                          placeholder="https://images.unsplash.com/... or logo URL"
                          className={inputClass}
                        />
                      </FormField>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-14 h-14 rounded-2xl border border-sand bg-white shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                          {form.logoUrl ? (
                            <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-xs font-black text-indigo">{initials}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-charcoal/50 leading-snug">
                          Appears in your profile header and on directory cards.
                        </span>
                      </div>
                    </div>

                    {/* Cover Banner */}
                    <div className="space-y-2">
                      <FormField label="Cover Banner Image URL" hint="Wide panoramic banner image (16:9 or 21:9)">
                        <TextInput
                          type="url"
                          value={form.coverImageUrl}
                          onChange={(e) => set("coverImageUrl", e.target.value)}
                          placeholder="https://images.unsplash.com/... or banner URL"
                          className={inputClass}
                        />
                      </FormField>
                      <div className="h-14 rounded-2xl border border-sand bg-white overflow-hidden relative">
                        {form.coverImageUrl ? (
                          <img src={form.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-indigo via-indigo-hover to-charcoal flex items-center justify-center text-[10px] text-white/70 font-bold">
                            Default Dark Mesh Gradient
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Firm / Agency Name" required>
                    <TextInput
                      type="text"
                      required
                      value={form.firmName}
                      onChange={(e) => set("firmName", e.target.value)}
                      placeholder="e.g. Sharma Realty Associates"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Business Category">
                    <CustomSelect
                      options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                      value={form.category}
                      onChange={(v) => set("category", v)}
                      accent="indigo"
                      buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
                    />
                  </FormField>
                  <FormField label="Operating City">
                    <CustomSelect
                      options={cityOptionsWithoutAll}
                      value={form.city}
                      onChange={(v) => set("city", v)}
                      accent="indigo"
                      buttonClassName="bg-sand/30 border border-indigo/10 text-xs font-semibold px-4 py-3 rounded-xl text-charcoal"
                      placeholder={locationsReady ? "Select city" : "Loading cities…"}
                    />
                  </FormField>
                  <FormField label="Team Size" hint="Number of active agents / advisors">
                    <TextInput
                      type="number"
                      min={1}
                      value={form.teamSize}
                      onChange={(e) => set("teamSize", e.target.value)}
                      placeholder="e.g. 5"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Office Address" className="sm:col-span-2">
                    <TextInput
                      type="text"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="e.g. 104 Palace View Road, Udaipur, Rajasthan 313001"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="About the Firm / Professional Bio" className="sm:col-span-2">
                    <TextArea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={4}
                      placeholder="Describe your specialization, prime target areas, track record, and customer approach."
                      className={`resize-none ${inputClass}`}
                    />
                  </FormField>

                  {/* Specialties */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-indigo uppercase tracking-wide block mb-2">
                      Property Specialties & Core Focus
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map((s) => {
                        const selected = form.specialties.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpec(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              selected
                                ? "bg-indigo border-indigo text-white shadow-xs"
                                : "bg-white border-indigo/10 text-charcoal/65 hover:border-indigo/30"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── KYC & RERA ── */}
            {activeTab === "KYC" && (
              <DealerKycPanel
                directoryProfileId={profile?.id}
                reraId={form.reraId}
                onReraIdChange={(value) => set("reraId", value)}
                inputClassName={inputClass}
                onKycChange={setKyc}
              />
            )}

            {/* ── Services & Hours ── */}
            {activeTab === "Services" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Services, Hours & Online Presence</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Manage your website link, working hours, and directory listing status.
                  </p>
                </div>

                {/* Website */}
                <FormField label="Website / Portfolio URL" hint="Shown as a clickable link on your public profile">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35" />
                    <TextInput
                      type="url"
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://youragency.com"
                      className={`pl-9 ${inputClass}`}
                    />
                  </div>
                  {form.website && (
                    <a
                      href={form.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo font-bold mt-1.5 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview link
                    </a>
                  )}
                </FormField>

                {/* Operating Hours */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-indigo uppercase tracking-wide block">
                    Working & Office Hours
                  </label>
                  <p className="text-[10px] text-charcoal/40 font-semibold">
                    Showcased under Office Contacts on your public page.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Monday – Friday">
                      <TextInput
                        type="text"
                        value={form.hoursWeekdays}
                        onChange={(e) => set("hoursWeekdays", e.target.value)}
                        placeholder="e.g. 9:30 AM – 7:30 PM"
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Saturday">
                      <TextInput
                        type="text"
                        value={form.hoursSaturday}
                        onChange={(e) => set("hoursSaturday", e.target.value)}
                        placeholder="e.g. 10:00 AM – 6:00 PM"
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Sunday">
                      <TextInput
                        type="text"
                        value={form.hoursSunday}
                        onChange={(e) => set("hoursSunday", e.target.value)}
                        placeholder="e.g. By Appointment Only"
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Services offered */}
                <div>
                  <label className="text-xs font-bold text-indigo uppercase tracking-wide block mb-2">
                    Services Offered
                  </label>
                  <p className="text-[10px] text-charcoal/40 font-semibold mb-3">
                    Select all that apply — rendered as service badges on your customer page.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SERVICES.map((s) => {
                      const selected = form.servicesOffered.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                            selected
                              ? "bg-terracotta/10 border-terracotta text-terracotta"
                              : "bg-white border-indigo/10 text-charcoal/65 hover:border-indigo/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected ? "bg-terracotta" : "bg-charcoal/20"}`} />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Directory Visibility */}
                <div className="p-4 rounded-2xl bg-sand/25 border border-indigo/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-charcoal">Public Directory Listing</p>
                    <p className="text-[10px] text-charcoal/50 font-semibold mt-0.5">
                      Toggle whether your profile appears in the public real estate directory for {form.city || "Rajasthan"}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("listingActive", !form.listingActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      form.listingActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-charcoal/20 text-charcoal/60"
                    }`}
                  >
                    {form.listingActive ? "Directory Active" : "Hidden"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Subscription ── */}
            {activeTab === "Subscription" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Subscription & Plan</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Your current SqftGo partner plan status and listing quota.
                  </p>
                </div>

                {subLoading ? (
                  <GlobalLoading label="Loading subscription…" />
                ) : (
                  <>
                    {/* Status card */}
                    <div className={`flex items-center gap-4 p-5 rounded-2xl border ${
                      subStatus === "active"
                        ? "bg-emerald-50 border-emerald-200"
                        : subStatus === "pending"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-sand/30 border-indigo/10"
                    }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        subStatus === "active" ? "bg-emerald-500/15 text-emerald-600"
                          : subStatus === "pending" ? "bg-amber-500/15 text-amber-600"
                          : "bg-indigo/10 text-indigo"
                      }`}>
                        <subConfig.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-black text-charcoal">
                            {subStatus === "active" ? "SqftGo Starter · ₹99/month" : "No Active Plan"}
                          </p>
                          <Badge tone={subConfig.tone} size="sm">{subConfig.label}</Badge>
                        </div>
                        {overview?.subscription && subStatus !== "inactive" ? (
                          <p className="text-xs font-semibold text-charcoal/55">
                            {subStatus === "active"
                              ? `Renews ${formatDate(overview.subscription.currentPeriodEnd)}`
                              : `Period ended ${formatDate(overview.subscription.currentPeriodEnd)}`}
                            {" · "}
                            {formatPlanPrice(overview.subscription.amountPaise)}/month
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-charcoal/55">
                            Subscribe to unlock all features — just ₹99/month.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quota grid */}
                    {quota && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Listings Used",   value: quota.used },
                          { label: "Included Cap",    value: quota.unlimited ? "Unlimited" : quota.quota },
                          { label: "Bought Packs",    value: quota.purchased },
                          { label: "Slots Remaining", value: quota.unlimited ? "∞" : quota.remaining },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-sand/25 border border-indigo/5 rounded-2xl p-4 text-center">
                            <p className="text-xl font-serif font-black text-indigo">{value}</p>
                            <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Active listings from profile */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo/4 border border-indigo/10 rounded-2xl p-4">
                        <p className="text-2xl font-serif font-black text-indigo">{myProperties.length}</p>
                        <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest mt-0.5">Total Listings</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4">
                        <p className="text-2xl font-serif font-black text-emerald-600">{activeListings.length}</p>
                        <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest mt-0.5">Active Listings</p>
                      </div>
                    </div>

                    {/* Recent payments */}
                    {overview?.recentPayments?.length ? (
                      <div>
                        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-3">Recent Payments</p>
                        <div className="divide-y divide-sand/60 rounded-2xl border border-indigo/10 overflow-hidden">
                          {overview.recentPayments.slice(0, 3).map((p) => (
                            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                              <div>
                                <p className="text-xs font-black capitalize text-charcoal">SqftGo {p.planId}</p>
                                <p className="text-[11px] font-semibold text-charcoal/45">{formatDate(p.paidAt ?? p.createdAt)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black tabular-nums text-charcoal">{formatPlanPrice(p.amountPaise)}</p>
                                <Badge size="sm" tone={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "neutral"}>
                                  {p.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-sand">
                      <p className="text-xs font-semibold text-charcoal/50">
                        Manage billing, checkout, and renewal on the Plans page.
                      </p>
                      <Link
                        href="/dealer/dashboard/subscription"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo hover:text-indigo/80 border border-indigo/20 px-4 py-2 rounded-xl hover:bg-indigo/5 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Plans & Billing
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Save footer */}
            {(activeTab === "Personal" || activeTab === "Business" || activeTab === "Services") && (
              <div className="flex justify-end pt-4 border-t border-indigo/5 mt-2">
                <Button type="submit" variant="secondary" size="md">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            )}
          </Panel>
        </form>
      )}
    </div>
  );
}
