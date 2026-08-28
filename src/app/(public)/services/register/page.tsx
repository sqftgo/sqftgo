"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { ServiceType } from "@/types";
import {
  Building,
  User,
  Tag,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Plus,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/components/ui/CustomSelect";
import { useActiveCities } from "@/hooks/useActiveCities";
import { servicePlatformService } from "@/services";
import { isServiceDirectoryCategory } from "@/features/dealers";

export default function RegisterServicePage() {
  const router = useRouter();
  const { addDirectoryProfile, isLoggedIn, sessionReady, userEmail, userName } = useApp();
  const { cities, cityOptionsWithoutAll, locationsReady } = useActiveCities();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [formData, setFormData] = useState({
    firmName: "",
    ownerName: "",
    serviceTypeId: "",
    city: "",
    address: "",
    email: "",
    website: "",
    mobile: "",
    description: "",
    businessRegistrationId: "",
    servicesOfferedText: "",
  });

  useEffect(() => {
    void servicePlatformService.listServiceTypes(false).then(setServiceTypes).catch(() => setServiceTypes([]));
  }, []);

  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (!formData.city || !cities.some((c) => c.toLowerCase() === formData.city.toLowerCase())) {
      setFormData((prev) => ({ ...prev, city: cities[0] ?? "" }));
    }
  }, [locationsReady, cities, formData.city]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/services/register")}`);
    }
  }, [sessionReady, isLoggedIn, router]);

  useEffect(() => {
    if (userEmail && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: userEmail,
        ownerName: prev.ownerName || userName || "",
      }));
    }
  }, [userEmail, userName, formData.email]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreeToVettingPledge, setAgreeToVettingPledge] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToVettingPledge || isSubmitting) return;
    if (!isLoggedIn) {
      setError("Please sign in before registering your firm in the directory.");
      return;
    }
    const selected = serviceTypes.find((s) => s.id === formData.serviceTypeId);
    if (!selected || !isServiceDirectoryCategory(selected.name)) {
      setError("Select a valid service type.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const offerings = formData.servicesOfferedText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await addDirectoryProfile({
        firmName: formData.firmName,
        ownerName: formData.ownerName,
        category: selected.name,
        serviceTypeId: selected.id,
        city: formData.city,
        address: formData.address,
        email: formData.email,
        website: formData.website,
        mobile: formData.mobile,
        description: formData.description,
        servicesOffered: offerings,
        verificationStatus: "unverified",
      } as Parameters<typeof addDirectoryProfile>[0]);

      try {
        await servicePlatformService.submitVerification({
          businessRegistrationId: formData.businessRegistrationId || null,
          ownerNotes: "Submitted with service registration",
        });
      } catch {
        // Profile created; verification can be completed on manage page
      }

      setIsSuccess(true);
      setAgreeToVettingPledge(false);
      setTimeout(() => router.push("/services/manage"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionReady || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center text-sm font-semibold text-charcoal/60">
        Sign in required to list your service business…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-20 pt-6">
      <Link
        href="/services"
        className="flex items-center gap-1.5 text-xs font-bold text-charcoal/60 hover:text-terracotta mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-black text-indigo">
                Register Your Service Business
              </h1>
              <p className="text-sm text-charcoal/65 mt-2">
                Help relocators in your city find architects, contractors, interiors, and more.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white/95 border border-sand rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6"
            >
              <h2 className="font-serif font-black text-lg text-indigo pb-2 border-b border-sand">
                Business Information
              </h2>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-xs text-indigo leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <strong className="text-terracotta">Verification:</strong> After registering,
                  submit your business registration details. Admins approve before the verified
                  badge appears. Your profile stays visible while pending.
                </div>
              </div>

              <div className="flex flex-col gap-5 text-sm font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-terracotta" />
                    <span>Firm / Business Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <User className="w-4 h-4 text-terracotta" />
                      <span>Owner&apos;s Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-terracotta" />
                      <span>Service type *</span>
                    </label>
                    <CustomSelect
                      options={serviceTypes.map((st) => ({ label: st.name, value: st.id }))}
                      value={formData.serviceTypeId}
                      onChange={(val) => setFormData({ ...formData, serviceTypeId: val })}
                      placeholder="Select service type"
                      searchable
                      buttonClassName="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal shadow-sm"
                      accent="terracotta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      <span>City *</span>
                    </label>
                    <CustomSelect
                      options={cityOptionsWithoutAll}
                      value={formData.city}
                      onChange={(val) => setFormData({ ...formData, city: val })}
                      placeholder="Select City"
                      searchable
                      buttonClassName="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal shadow-sm"
                      accent="terracotta"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      <span>Business Address *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-terracotta" />
                      <span>Email *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-terracotta" />
                      <span>Mobile *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-terracotta" />
                    <span>Work description *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo text-sm">Services offered (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Full home interiors, Modular kitchen, Vastu audit"
                    value={formData.servicesOfferedText}
                    onChange={(e) =>
                      setFormData({ ...formData, servicesOfferedText: e.target.value })
                    }
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo text-sm">Business registration / GST ID</label>
                  <input
                    type="text"
                    value={formData.businessRegistrationId}
                    onChange={(e) =>
                      setFormData({ ...formData, businessRegistrationId: e.target.value })
                    }
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs font-semibold select-none cursor-pointer mt-1">
                <input
                  id="agreeToVettingPledge"
                  type="checkbox"
                  required
                  checked={agreeToVettingPledge}
                  onChange={(e) => setAgreeToVettingPledge(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-terracotta shrink-0 cursor-pointer"
                />
                <label htmlFor="agreeToVettingPledge" className="cursor-pointer leading-tight text-left text-charcoal/70">
                  I confirm the business details are accurate and agree to SqftGo verification. *
                </label>
              </div>

              {error ? (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || !agreeToVettingPledge || !formData.serviceTypeId}
                className="mt-2 py-3 w-full bg-indigo hover:bg-indigo-hover text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-55 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting…" : "Create service profile"}</span>
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-sand rounded-3xl p-10 text-center shadow-md"
          >
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="font-serif font-black text-2xl text-indigo mb-2">Profile created</h2>
            <p className="text-sm text-charcoal/60 font-semibold mb-6">
              Taking you to your service manage page…
            </p>
            <Link
              href="/services/manage"
              className="inline-flex px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-bold"
            >
              Open manage page
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
