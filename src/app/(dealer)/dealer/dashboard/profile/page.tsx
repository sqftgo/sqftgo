"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Save,
  User,
  Globe,
  ShieldCheck,
  CreditCard,
  Building2,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import {
  DashboardPageHeader,
  Button,
  Alert,
  Panel,
  Avatar,
  Badge,
  FormField,
  TextInput,
  TextArea,
  CustomSelect,
} from "@/components/ui";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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

const TABS = [
  { id: "Personal", label: "Personal Information", icon: User },
  { id: "Business", label: "Business Details", icon: Building2 },
  { id: "KYC & Verification", label: "KYC & RERA", icon: FileCheck },
  { id: "Bank Details", label: "Bank Settlement", icon: CreditCard },
  { id: "Socials", label: "Social Networks", icon: Globe },
  { id: "Subscription & Performance", label: "Subscription Info", icon: Award },
];

export default function DealerProfilePage() {
  const { userEmail, directoryProfiles, setDirectoryProfiles, properties } = useApp();
  const profile = directoryProfiles.find((p) => p.email.toLowerCase() === userEmail.toLowerCase());
  const myProperties = properties.filter(
    (p) => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  const [activeTab, setActiveTab] = useState("Personal");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    firmName: profile?.firmName || "",
    ownerName: profile?.ownerName || "",
    category: profile?.category || "Agent & Broker",
    address: profile?.address || "",
    mobile: profile?.mobile || "",
    website: profile?.website || "",
    reraId: profile?.reraId || "",
    description: profile?.description || "",
    specialties: profile?.specialties || [],
    experience: profile?.experience || "",
    pan: "ABCDE1234F",
    aadhar: "•••• •••• 9876",
    bankName: "HDFC Bank",
    bankAcc: "50100043219876",
    bankIfsc: "HDFC0000240",
    bankBranch: "Lake Palace Branch",
    fb: "facebook.com/dealer",
    insta: "instagram.com/dealer",
    linkedin: "linkedin.com/in/dealer",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSpec = (s: string) => {
    const isSelected = form.specialties.includes(s);
    set(
      "specialties",
      isSelected ? form.specialties.filter((x: string) => x !== s) : [...form.specialties, s]
    );
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    setDirectoryProfiles((prev) =>
      prev.map((p) =>
        p.email.toLowerCase() === userEmail.toLowerCase()
          ? { ...p, ...form, category: form.category as any }
          : p
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "focus:border-indigo/40 focus:ring-indigo/10";

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Dealer Profile"
        description="Manage your public directory presence, KYC, and settlement details."
        className="rounded-3xl"
        actions={
          <Button type="button" variant="secondary" onClick={() => handleSave()} size="md">
            <Save className="w-4 h-4" /> Save Account Profile
          </Button>
        }
      />

      <Panel
        padding="lg"
        rounded="3xl"
        className="flex flex-col md:flex-row gap-6 items-center justify-between"
      >
        <div className="flex items-center gap-5 w-full md:w-auto">
          <Avatar
            name={form.ownerName || "D"}
            size="xl"
            tone="indigo"
            shape="rounded"
            className="w-[72px] h-[72px]"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-serif font-black text-charcoal leading-none truncate">
                {form.firmName || "Broker Firm Name"}
              </h2>
              <Badge tone="success" size="sm" className="shrink-0 gap-1">
                <ShieldCheck className="w-3 h-3" />
                KYC Verified
              </Badge>
            </div>
            <p className="text-xs text-charcoal/50 font-semibold truncate">
              Managed by <strong className="text-charcoal">{form.ownerName || "Dealer User"}</strong>{" "}
              · {userEmail}
            </p>
            <p className="text-[10px] text-indigo font-bold">{form.category} Category</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-indigo/5 pt-4 md:border-t-0 md:pt-0 shrink-0">
          <div className="px-4 py-2 bg-sand/35 rounded-2xl border border-indigo/5 text-center min-w-[80px]">
            <span className="block text-lg font-serif font-black text-indigo">
              {myProperties.length}
            </span>
            <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">
              Active Listings
            </span>
          </div>
          <div className="px-4 py-2 bg-indigo/5 rounded-2xl border border-indigo/10 text-center min-w-[80px]">
            <span className="block text-lg font-serif font-black text-indigo">Pro</span>
            <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">
              Partner Tier
            </span>
          </div>
        </div>
      </Panel>

      {saved && (
        <Alert
          variant="success"
          title="Profile Update Complete"
          description="Your changes have been updated in the business directory."
          onDismiss={() => setSaved(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Panel padding="sm" rounded="3xl" className="lg:col-span-4 space-y-1 p-3">
          <p className="px-3 pt-2 pb-1 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
            Profile Settings
          </p>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  active
                    ? "bg-indigo text-white shadow-sm"
                    : "text-charcoal/60 hover:bg-indigo/5 hover:text-indigo"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-charcoal/45"}`} />
                <span>{tab.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white" />}
              </button>
            );
          })}
        </Panel>

        <form onSubmit={handleSave} className="lg:col-span-8">
          <Panel padding="lg" rounded="3xl" className="md:p-8 space-y-6">
            {activeTab === "Personal" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Personal Profile</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Update your personal representative profile info.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Owner / Representative Name" required>
                    <TextInput
                      type="text"
                      required
                      value={form.ownerName}
                      onChange={(e) => set("ownerName", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Mobile Contact Number" required>
                    <TextInput
                      type="text"
                      required
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Experience Level (e.g. 5+ Years)">
                    <TextInput
                      type="text"
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      placeholder="e.g. 8+ Years"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Registered User Email">
                    <TextInput
                      type="email"
                      disabled
                      value={userEmail || "dealer@sunvalley.com"}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "Business" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Business Details</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Configure details displayed in the public Directory page.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Firm / Brokerage Agency Title" required>
                    <TextInput
                      type="text"
                      required
                      value={form.firmName}
                      onChange={(e) => set("firmName", e.target.value)}
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

                  <FormField label="Website URL" className="sm:col-span-2">
                    <TextInput
                      type="text"
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://agencywebsite.com"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Office Address" className="sm:col-span-2">
                    <TextInput
                      type="text"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="e.g. 104 Palace View, Udaipur"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="About / Professional Bio" className="sm:col-span-2">
                    <TextArea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={4}
                      placeholder="Describe your specialization, target locality, and customer satisfaction record."
                      className={`resize-none ${inputClass}`}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-indigo uppercase tracking-wide block mb-2">
                      Specialties Selection (Toggle active tags)
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

            {activeTab === "KYC & Verification" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">
                    Regulatory & KYC Documents
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Verification status of business licenses, tax documents, and RERA credentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Permanent Account Number (PAN)">
                    <TextInput
                      type="text"
                      value={form.pan}
                      onChange={(e) => set("pan", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Aadhar UIDAI Number">
                    <TextInput
                      type="text"
                      value={form.aadhar}
                      onChange={(e) => set("aadhar", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="RERA Registration Certificate ID" className="sm:col-span-2">
                    <TextInput
                      type="text"
                      value={form.reraId}
                      onChange={(e) => set("reraId", e.target.value)}
                      placeholder="e.g. RAJ-RERA-A-2025-XXXX"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <Alert
                  variant="success"
                  title="Verification Verified"
                  description="Verification documents checked on July 16, 2026. Verified status boosts lead conversions by displaying verification badge next to your property cards."
                />
              </div>
            )}

            {activeTab === "Bank Details" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">
                    Settlement Account Details
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Configure the bank account for customer refunds or brokerage payouts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Bank Entity Name">
                    <TextInput
                      type="text"
                      value={form.bankName}
                      onChange={(e) => set("bankName", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Settlement Account Number">
                    <TextInput
                      type="text"
                      value={form.bankAcc}
                      onChange={(e) => set("bankAcc", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="IFSC Routing Code">
                    <TextInput
                      type="text"
                      value={form.bankIfsc}
                      onChange={(e) => set("bankIfsc", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Bank Branch Locality">
                    <TextInput
                      type="text"
                      value={form.bankBranch}
                      onChange={(e) => set("bankBranch", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "Socials" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Social Profiles</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Attach your social media profile URLs so buyers can connect with you.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField label="Facebook Business Profile">
                    <div className="relative">
                      <FacebookIcon className="w-4 h-4 text-indigo/60 absolute left-4 top-1/2 -translate-y-1/2" />
                      <TextInput
                        type="text"
                        value={form.fb}
                        onChange={(e) => set("fb", e.target.value)}
                        className={`pl-12 ${inputClass}`}
                      />
                    </div>
                  </FormField>

                  <FormField label="Instagram Handler Profile">
                    <div className="relative">
                      <InstagramIcon className="w-4 h-4 text-indigo/60 absolute left-4 top-1/2 -translate-y-1/2" />
                      <TextInput
                        type="text"
                        value={form.insta}
                        onChange={(e) => set("insta", e.target.value)}
                        className={`pl-12 ${inputClass}`}
                      />
                    </div>
                  </FormField>

                  <FormField label="LinkedIn Personal Link">
                    <div className="relative">
                      <LinkedinIcon className="w-4 h-4 text-indigo/60 absolute left-4 top-1/2 -translate-y-1/2" />
                      <TextInput
                        type="text"
                        value={form.linkedin}
                        onChange={(e) => set("linkedin", e.target.value)}
                        className={`pl-12 ${inputClass}`}
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "Subscription & Performance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">
                    Plan Tier & Conversions
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Analyze your lead conversion statistics and billing information.
                  </p>
                </div>

                <div className="bg-indigo/5 border border-indigo/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo/10 flex items-center justify-center text-indigo">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-charcoal">Pro Premium Partner Plan</h4>
                      <p className="text-[9px] text-charcoal/40 font-semibold mt-0.5">
                        Renews automatically: August 15, 2026
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" className="bg-indigo text-white border-indigo">
                    Active Pro
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-indigo/10 rounded-2xl p-5 space-y-2 bg-[#faf8f5]">
                    <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">
                      Active Listings
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-serif font-black text-indigo">
                        {myProperties.length}
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +1 this week
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/50 font-semibold leading-relaxed">
                      Total approved property listings currently indexed on the platform search
                      database.
                    </p>
                  </div>

                  <div className="border border-indigo/10 rounded-2xl p-5 space-y-2 bg-[#faf8f5]">
                    <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">
                      Conversion Performance
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-serif font-black text-indigo">48 Leads</p>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +18% MoM
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal/50 font-semibold leading-relaxed">
                      Unique buyers who contacted you or submitted property inquiry proposals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-indigo/5 mt-4">
              <Button type="submit" variant="secondary" size="md">
                <Save className="w-4 h-4" /> Save Account Profile
              </Button>
            </div>
          </Panel>
        </form>
      </div>
    </div>
  );
}
