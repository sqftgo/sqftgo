"use client";

import { AlertCircle } from "lucide-react";
import { formatInr, type ProjectFormValues } from "../types";

type Props = {
  form: ProjectFormValues;
};

export function ReviewStep({ form }: Props) {
  const sizeLabel =
    form.sizeFrom != null || form.sizeTo != null
      ? `${form.sizeFrom ?? "—"} – ${form.sizeTo ?? "—"} sq.ft`
      : "—";
  const priceLabel =
    form.priceFrom != null || form.priceTo != null
      ? `${formatInr(form.priceFrom)} – ${formatInr(form.priceTo)}`
      : "—";

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Review & Publish</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Check all details before submitting for admin review.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["Title", form.title],
              ["Role", form.ownershipRole],
              ["Stage", form.lifecycle],
              ["City", `${form.city}${form.state ? `, ${form.state}` : ""}`],
              ["Locality", form.locality],
              ["Inventory", form.propertyTypes.join(", ") || "—"],
              ["Configurations", form.configurations.join(", ") || "—"],
              ["Size", sizeLabel],
              ["Price", priceLabel],
              ["Contact", `${form.contactName} · ${form.contactPhone}`],
              ["Amenities", `${form.amenities.length} selected`],
              ["Images", `${form.images.length} photos`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-sand/15 border border-indigo/5 rounded-2xl px-4 py-3">
              <p className="text-[9px] font-black text-charcoal/45 uppercase tracking-widest">
                {label}
              </p>
              <p className="text-xs font-bold text-charcoal mt-1 line-clamp-2">{value || "—"}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 text-xs text-amber-800 leading-relaxed font-semibold">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 leading-none">Verification Pending</p>
            <p className="mt-1.5 text-amber-700/80">
              Submitting marks this project as &quot;Pending Review&quot;. An admin will verify
              details before it can appear publicly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
