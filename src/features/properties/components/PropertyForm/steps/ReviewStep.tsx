"use client";

import { AlertCircle } from "lucide-react";
import type { FormState } from "../types";

type ReviewStepProps = {
  form: FormState;
};

export function ReviewStep({ form }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Review & Publish</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Check all input details and launch the listing publicly.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["Title", form.title],
              ["Type", form.type],
              [
                "Purpose",
                form.purpose === "buy"
                  ? "For Sale"
                  : form.purpose === "rent"
                    ? "For Rent"
                    : "For Lease",
              ],
              ["City", `${form.city}, ${form.state}`],
              ["Locality", form.locality],
              ["Size", `${form.size} sq.ft.`],
              ["BHK", form.bhk ? `${form.bhk} BHK` : "ΓÇö"],
              [
                "Price",
                form.price ? `Γé╣${parseInt(form.price).toLocaleString("en-IN")}` : "ΓÇö",
              ],
              ["Amenities", `${form.amenities.length} selected`],
              ["Images", `${form.images.length} photos`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-sand/15 border border-indigo/5 rounded-2xl px-4 py-3">
              <p className="text-[9px] font-black text-charcoal/45 uppercase tracking-widest">
                {label}
              </p>
              <p className="text-xs font-bold text-charcoal mt-1 line-clamp-1">{value || "ΓÇö"}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 text-xs text-amber-800 leading-relaxed font-semibold">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 leading-none">Verification Pending</p>
            <p className="mt-1.5 text-amber-700/80">
              By submitting this listing, it will be marked as &quot;Pending Review&quot;. The admin
              team will verify the details (like RERA status, owner info) before it goes live on the
              public site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
