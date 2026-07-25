"use client";

import React, { useEffect, useState } from "react";
import { useApp, type DirectoryProfile } from "@/context/AppContext";
import { kycService } from "@/services";
import type { DealerKycRecord } from "@/types";
import {
  Save,
  User,
  Globe,
  ShieldCheck,
  CreditCard,
  Building2,
  Award,
  ChevronRight,
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
import { findMyDirectoryProfile, filterMyProperties } from "@/lib/ownership";

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
  const { userEmail, userProfile, directoryProfiles, updateDirectoryProfile, properties } = useApp();
  const profile = findMyDirectoryProfile(directoryProfiles, userProfile?.id, userEmail);
  const myProperties = filterMyProperties(properties, userProfile?.id, userEmail);

  const [activeTab, setActiveTab] = useState("Personal");
  const [saved, setSaved] = useState(false);
  const [kyc, setKyc] = useState<DealerKycRecord | null>(null);
  const [kycForm, setKycForm] = useState({
    panNumber: "",
    aadhaarLast4: "",
    dealerNotes: "",
  });
  const [kycBusy, setKycBusy] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycMessage, setKycMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const record = await kycService.getMine();
        if (cancelled) return;
        setKyc(record);
        if (record) {
          setKycForm({
            panNumber: record.panNumber ?? "",
            aadhaarLast4: record.aadhaarLast4 ?? "",
            dealerNotes: record.dealerNotes ?? "",
          });
        }
      } catch {
        // KYC optional until migration applied
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSpec = (s: string) => {
    const isSelected = form.specialties.includes(s);
    set(
      "specialties",
      isSelected ? form.specialties.filter((x: string) => x !== s) : [...form.specialties, s]
    );
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!profile?.id) return;
    setSaveError(null);
    try {
      await updateDirectoryProfile(profile.id, {
        firmName: form.firmName,
        ownerName: form.ownerName,
        category: form.category as DirectoryProfile["category"],
        address: form.address,
        mobile: form.mobile,
        website: form.website,
        reraId: form.reraId || undefined,
        description: form.description,
        specialties: form.specialties,
        experience: form.experience || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save profile");
    }
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
                {form.firmName || "Dealer Firm Name"}
              </h2>
              {kyc?.status === "approved" ? (
                <Badge tone="success" size="sm" className="shrink-0 gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  KYC approved
                </Badge>
              ) : kyc?.status === "pending" ? (
                <Badge tone="warning" size="sm" className="shrink-0 gap-1">
                  KYC pending
                </Badge>
              ) : form.reraId ? (
                <Badge tone="success" size="sm" className="shrink-0 gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  RERA listed
                </Badge>
              ) : (
                <Badge tone="neutral" size="sm" className="shrink-0 gap-1">
                  KYC not submitted
                </Badge>
              )}
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
        </div>
      </Panel>

      {saveError && (
        <Alert
          variant="danger"
          title="Could not save profile"
          description={saveError}
          onDismiss={() => setSaveError(null)}
        />
      )}

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
                      value={userEmail || "dealer@sqftgo.com"}
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
                  <FormField label="Firm / Agency Title" required>
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
                    Private KYC & RERA
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    KYC is stored in a private table (not on the public directory).
                    RERA ID remains part of your public business profile.
                  </p>
                </div>

                {kycError ? (
                  <Alert variant="danger" title="KYC error" description={kycError} />
                ) : null}
                {kycMessage ? (
                  <Alert variant="success" title="KYC updated" description={kycMessage} />
                ) : null}
                {kyc?.status === "rejected" && kyc.rejectionReason ? (
                  <Alert
                    variant="warning"
                    title="KYC rejected"
                    description={kyc.rejectionReason}
                  />
                ) : null}

                <FormField label="RERA Registration Certificate ID (public directory)">
                  <TextInput
                    type="text"
                    value={form.reraId}
                    onChange={(e) => set("reraId", e.target.value)}
                    placeholder="e.g. RAJ-RERA-A-2025-XXXX"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="PAN number (private)">
                  <TextInput
                    type="text"
                    value={kycForm.panNumber}
                    onChange={(e) =>
                      setKycForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))
                    }
                    disabled={kyc?.status === "pending" || kyc?.status === "approved"}
                    placeholder="ABCDE1234F"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Aadhaar last 4 digits (private)">
                  <TextInput
                    type="text"
                    value={kycForm.aadhaarLast4}
                    onChange={(e) =>
                      setKycForm((f) => ({
                        ...f,
                        aadhaarLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    disabled={kyc?.status === "pending" || kyc?.status === "approved"}
                    placeholder="1234"
                    className={inputClass}
                    maxLength={4}
                  />
                </FormField>

                <FormField label="Notes for reviewer">
                  <TextArea
                    value={kycForm.dealerNotes}
                    onChange={(e) =>
                      setKycForm((f) => ({ ...f, dealerNotes: e.target.value }))
                    }
                    disabled={kyc?.status === "pending" || kyc?.status === "approved"}
                    rows={3}
                  />
                </FormField>

                <FormField label="Upload document (PAN / Aadhaar / RERA PDF)">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={kyc?.status === "pending" || kyc?.status === "approved" || kycBusy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setKycBusy(true);
                      setKycError(null);
                      try {
                        // Ensure draft exists before upload
                        const saved = await kycService.save({
                          panNumber: kycForm.panNumber || null,
                          aadhaarLast4: kycForm.aadhaarLast4 || null,
                          dealerNotes: kycForm.dealerNotes,
                          directoryProfileId: profile?.id ?? null,
                          submit: false,
                        });
                        setKyc(saved);
                        const doc = await kycService.uploadDocument(file, "other");
                        setKyc((prev) =>
                          prev
                            ? { ...prev, documents: [doc, ...prev.documents] }
                            : prev
                        );
                        setKycMessage(`Uploaded ${doc.fileName}`);
                      } catch (err) {
                        setKycError(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setKycBusy(false);
                        e.target.value = "";
                      }
                    }}
                    className="block w-full text-xs"
                  />
                  {kyc?.documents?.length ? (
                    <p className="text-[10px] text-charcoal/50 font-semibold mt-2">
                      {kyc.documents.length} document(s) on file
                    </p>
                  ) : null}
                </FormField>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={kycBusy || kyc?.status === "pending" || kyc?.status === "approved"}
                    onClick={async () => {
                      setKycBusy(true);
                      setKycError(null);
                      try {
                        const saved = await kycService.save({
                          panNumber: kycForm.panNumber || null,
                          aadhaarLast4: kycForm.aadhaarLast4 || null,
                          dealerNotes: kycForm.dealerNotes,
                          directoryProfileId: profile?.id ?? null,
                          submit: false,
                        });
                        setKyc(saved);
                        setKycMessage("KYC draft saved");
                      } catch (err) {
                        setKycError(err instanceof Error ? err.message : "Save failed");
                      } finally {
                        setKycBusy(false);
                      }
                    }}
                  >
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={kycBusy || kyc?.status === "pending" || kyc?.status === "approved"}
                    onClick={async () => {
                      setKycBusy(true);
                      setKycError(null);
                      try {
                        const saved = await kycService.save({
                          panNumber: kycForm.panNumber || null,
                          aadhaarLast4: kycForm.aadhaarLast4 || null,
                          dealerNotes: kycForm.dealerNotes,
                          directoryProfileId: profile?.id ?? null,
                          submit: true,
                        });
                        setKyc(saved);
                        setKycMessage("Submitted for admin review");
                      } catch (err) {
                        setKycError(err instanceof Error ? err.message : "Submit failed");
                      } finally {
                        setKycBusy(false);
                      }
                    }}
                  >
                    Submit for review
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "Bank Details" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">
                    Settlement Account Details
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Bank settlement is not available on the platform yet.
                  </p>
                </div>
                <Alert
                  variant="warning"
                  title="Bank details not stored"
                  description="There is no settlement account API. Entering account numbers here would not save — fields have been removed until a secure vault exists."
                />
              </div>
            )}

            {activeTab === "Socials" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">Social Profiles</h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Social links are not part of the directory schema yet.
                  </p>
                </div>
                <Alert
                  variant="info"
                  title="Social profiles unavailable"
                  description="Facebook, Instagram, and LinkedIn URLs are not persisted. Use your website field under Business Details for a public link."
                />
              </div>
            )}

            {activeTab === "Subscription & Performance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-black text-charcoal">
                    Plan Tier & Conversions
                  </h3>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                    Billing and lead analytics are not wired yet.
                  </p>
                </div>

                <Alert
                  variant="warning"
                  title="No subscription or fabricated KPIs"
                  description="Partner tiers, renewal dates, and conversion percentages are not stored. Listing count below is from your real properties."
                />

                <div className="border border-indigo/10 rounded-2xl p-5 space-y-2 bg-[#faf8f5]">
                  <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">
                    Your listings
                  </span>
                  <p className="text-2xl font-serif font-black text-indigo">
                    {myProperties.length}
                  </p>
                  <p className="text-[10px] text-charcoal/50 font-semibold leading-relaxed">
                    Properties currently associated with your account email.
                  </p>
                </div>
              </div>
            )}

            {(activeTab === "Personal" || activeTab === "Business") && (
            <div className="flex justify-end pt-4 border-t border-indigo/5 mt-4">
              <Button type="submit" variant="secondary" size="md">
                <Save className="w-4 h-4" /> Save Account Profile
              </Button>
            </div>
            )}
          </Panel>
        </form>
      </div>
    </div>
  );
}
