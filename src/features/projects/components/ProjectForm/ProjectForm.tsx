"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AMENITIES as AMENITY_FALLBACK } from "@/constants";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { uploadPropertyImage } from "@/lib/uploads/propertyImage";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Save,
  Send,
  Check,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECT_CREATE_STEPS } from "./constants";
import {
  emptyProjectForm,
  formatInr,
  type ProjectFormProps,
  type ProjectFormValues,
} from "./types";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationInventoryStep } from "./steps/LocationInventoryStep";
import { PricingTimelineStep } from "./steps/PricingTimelineStep";
import { AmenitiesStep } from "./steps/AmenitiesStep";
import { MediaSeoStep } from "./steps/MediaSeoStep";
import { ReviewStep } from "./steps/ReviewStep";
import {
  configurationOptionsForTypes,
  sizeFieldCopy,
} from "@/features/projects/lib/inventoryOptions";

export type { ProjectFormProps, ProjectFormValues } from "./types";

export function ProjectForm({
  mode,
  initial,
  defaultContactName,
  defaultContactPhone,
  onSubmit,
}: ProjectFormProps) {
  const router = useRouter();
  const { amenities } = useApp();
  const amenityOptions = useMemo(() => {
    const live = amenities.filter((a) => a.active).map((a) => a.name);
    return live.length > 0 ? live : [...AMENITY_FALLBACK];
  }, [amenities]);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<"draft" | "published" | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProjectFormValues>(() =>
    emptyProjectForm(initial, { name: defaultContactName, phone: defaultContactPhone }),
  );

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm(emptyProjectForm(initial, { name: defaultContactName, phone: defaultContactPhone }));
    }
  }, [mode, initial, defaultContactName, defaultContactPhone]);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a: string) =>
    set(
      "amenities",
      form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a],
    );

  const addImageUrl = (url: string) => {
    if (url && url.startsWith("http")) {
      set("images", [...form.images, url]);
      setNewImageUrl("");
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploadError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadPropertyImage(file));
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 30) }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    set(
      "images",
      form.images.filter((_, i) => i !== index),
    );
  };

  const validateForStatus = (status: ProjectFormValues["status"]): string | null => {
    if (form.title.trim().length < 3) return "Title must be at least 3 characters";
    if (!form.city.trim()) return "City is required";
    if (form.locality.trim().length < 2) return "Locality is required";
    if (form.description.trim().length < 1) return "Description is required";
    if (form.propertyTypes.length < 1) return "Select at least one property type";
    if (form.contactName.trim().length < 1) return "Contact name is required";
    if (form.contactPhone.trim().length < 5) return "Contact phone is required";
    if (
      form.priceFrom != null &&
      form.priceTo != null &&
      form.priceFrom > form.priceTo
    ) {
      return "Price “to” must be ≥ price “from”";
    }
    if (form.sizeFrom != null && form.sizeTo != null && form.sizeFrom > form.sizeTo) {
      return "Size “to” must be ≥ size “from”";
    }
    if (status === "Pending Review" && form.images.length < 1) {
      return "Add at least one image before submitting for review";
    }
    return null;
  };

  const canNext = [
    Boolean(form.title && form.description && form.contactName && form.contactPhone),
    Boolean(form.city && form.locality && form.propertyTypes.length > 0),
    true,
    true,
    true,
    true,
  ][step];

  const runSubmit = async (status: "Draft" | "Pending Review") => {
    const err = validateForStatus(status);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      await onSubmit({ ...form, status });
      if (mode === "create") {
        setSubmitted(status === "Draft" ? "draft" : "published");
        setTimeout(() => router.push("/dealer/dashboard/projects"), 2000);
      } else {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          router.push("/dealer/dashboard/projects");
        }, 1500);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const sizeCopy = sizeFieldCopy(form.propertyTypes);
  const configOptions = configurationOptionsForTypes(form.propertyTypes);

  if (mode === "create" && submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-cream">
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-12 max-w-sm w-full text-center shadow-md">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${
              submitted === "published"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-indigo/10 border-indigo/20 text-indigo"
            }`}
          >
            {submitted === "published" ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <Save className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-serif font-black text-charcoal mb-2">
            {submitted === "published" ? "Project Submitted!" : "Draft Saved!"}
          </h2>
          <p className="text-charcoal/50 text-sm font-semibold">
            {submitted === "published"
              ? "Your project is pending admin review. You'll be notified once it goes live."
              : "Your draft has been successfully saved. Redirecting to your projects..."}
          </p>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="p-6 md:p-8 bg-cream min-h-screen text-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b border-sand/40 pb-5">
            <div>
              <h1 className="text-3xl font-serif font-black text-indigo tracking-tight">
                Add New Project
              </h1>
              <p className="text-charcoal/50 text-xs font-semibold mt-1">
                Complete the wizard to submit your project or save as draft.
              </p>
            </div>
          </div>

          {formError ? (
            <Alert
              variant="danger"
              title="Fix before continuing"
              description={formError}
              onDismiss={() => setFormError(null)}
              className="mb-6"
            />
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="flex flex-row lg:flex-col gap-3 lg:col-span-3 overflow-x-auto no-scrollbar pb-3 lg:pb-0">
              {PROJECT_CREATE_STEPS.map((s, i) => {
                const Icon = s.icon;
                const isCurrent = i === step;
                const isCompleted = i < step;
                return (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left border transition-all duration-200 shrink-0 w-auto lg:w-full select-none cursor-pointer ${
                      isCurrent
                        ? "bg-indigo border-indigo text-white shadow-md shadow-indigo/15 scale-[1.02]"
                        : isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700"
                          : "bg-white border-sand text-charcoal/50 hover:border-indigo/25"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        isCurrent
                          ? "bg-white/10 border-white/20 text-white"
                          : isCompleted
                            ? "bg-emerald-100/50 border-emerald-200 text-emerald-600"
                            : "bg-sand/15 border-sand text-charcoal/40"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden sm:block lg:flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                        {s.title}
                      </span>
                      <span
                        className={`text-[9px] font-semibold mt-1.5 leading-none ${
                          isCurrent
                            ? "text-white/60"
                            : isCompleted
                              ? "text-emerald-600/70"
                              : "text-charcoal/35"
                        }`}
                      >
                        {s.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm lg:col-span-9">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="s0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <BasicInfoStep form={form} set={set} />
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <LocationInventoryStep form={form} set={set} setForm={setForm} />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <PricingTimelineStep form={form} set={set} />
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <AmenitiesStep
                      form={form}
                      amenityOptions={amenityOptions}
                      toggleAmenity={toggleAmenity}
                    />
                  </motion.div>
                )}
                {step === 4 && (
                  <motion.div
                    key="s4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MediaSeoStep
                      form={form}
                      set={set}
                      fileInputRef={fileInputRef}
                      uploading={uploading}
                      uploadError={uploadError}
                      newImageUrl={newImageUrl}
                      setNewImageUrl={setNewImageUrl}
                      handleFileUpload={handleFileUpload}
                      addImageUrl={addImageUrl}
                      removeImage={removeImage}
                    />
                  </motion.div>
                )}
                {step === 5 && (
                  <motion.div
                    key="s5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ReviewStep form={form} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between border-t border-sand/50 pt-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || saving}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving || uploading}
                    onClick={() => void runSubmit("Draft")}
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>

                  {step < PROJECT_CREATE_STEPS.length - 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => canNext && setStep((s) => s + 1)}
                      disabled={!canNext || saving}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={saving || uploading}
                      onClick={() => void runSubmit("Pending Review")}
                      className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/15"
                    >
                      <Send className="w-4 h-4" /> Submit Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-cream min-h-screen text-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-sand/40 pb-5 bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              aria-label="Go back"
              className="px-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-left">
              <h1 className="text-2xl font-serif font-black text-indigo">Edit Project</h1>
              <p className="text-charcoal/50 text-xs font-semibold mt-0.5">
                Update project details below.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-indigo/40">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {saved ? (
          <Alert
            variant="success"
            title="Changes saved successfully!"
            description="Redirecting..."
            className="mb-6 text-left"
          />
        ) : null}

        {formError ? (
          <Alert
            variant="danger"
            title="Could not save"
            description={formError}
            onDismiss={() => setFormError(null)}
            className="mb-6"
          />
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <BasicInfoStep form={form} set={set} />
            </div>
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <LocationInventoryStep form={form} set={set} setForm={setForm} />
            </div>
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <PricingTimelineStep form={form} set={set} />
            </div>
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <AmenitiesStep
                form={form}
                amenityOptions={amenityOptions}
                toggleAmenity={toggleAmenity}
              />
            </div>
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <MediaSeoStep
                form={form}
                set={set}
                fileInputRef={fileInputRef}
                uploading={uploading}
                uploadError={uploadError}
                newImageUrl={newImageUrl}
                setNewImageUrl={setNewImageUrl}
                handleFileUpload={handleFileUpload}
                addImageUrl={addImageUrl}
                removeImage={removeImage}
              />
            </div>

            <div className="flex justify-between items-center bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving || uploading}
                  onClick={() => void runSubmit("Draft")}
                >
                  <Save className="w-4 h-4" /> Save as Draft
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={saving || uploading}
                  onClick={() => void runSubmit("Pending Review")}
                >
                  <Send className="w-4 h-4" /> Save & Submit
                </Button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-3 space-y-4 sticky top-6">
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
                Snapshot
              </p>
              <p className="text-sm font-serif font-black text-charcoal line-clamp-2">
                {form.title || "Untitled project"}
              </p>
              <p className="text-[11px] font-semibold text-charcoal/50">
                {form.locality || "Locality"}
                {form.city ? `, ${form.city}` : ""}
              </p>
              <p className="text-xs font-bold text-indigo">
                {form.priceFrom != null || form.priceTo != null
                  ? `${formatInr(form.priceFrom)} – ${formatInr(form.priceTo)}`
                  : "Price on request"}
              </p>
              <p className="text-[10px] font-semibold text-charcoal/45">
                {form.propertyTypes.join(" · ") || "No inventory types"}
              </p>
              <p className="text-[10px] font-semibold text-charcoal/45">
                Size: {form.sizeFrom ?? "—"}–{form.sizeTo ?? "—"} sq.ft
              </p>
              <p className="text-[10px] font-semibold text-charcoal/40">{sizeCopy.hint}</p>
              <p className="text-[10px] font-semibold text-charcoal/45">
                {form.configurations.length
                  ? configOptions.filter((c) => form.configurations.includes(c)).join(", ")
                  : "No configurations"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
