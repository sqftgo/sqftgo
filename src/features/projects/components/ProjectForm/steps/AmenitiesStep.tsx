"use client";

import { Check } from "lucide-react";
import type { ProjectFormValues } from "../types";

type Props = {
  form: ProjectFormValues;
  amenityOptions: string[];
  toggleAmenity: (a: string) => void;
};

export function AmenitiesStep({ form, amenityOptions, toggleAmenity }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Amenities Selection</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Select facilities available across this project.
        </p>
      </div>

      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-sand/50 pb-3">
          <span className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
            Available Features
          </span>
          <span className="text-[10px] font-bold text-charcoal/50">
            {form.amenities.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {amenityOptions.map((a) => {
            const selected = form.amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-left select-none ${
                  selected
                    ? "bg-indigo text-white border-indigo shadow-md shadow-indigo/15 scale-[1.01]"
                    : "bg-white border-sand hover:border-indigo/30 text-charcoal/70"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    selected
                      ? "bg-white text-indigo border-white"
                      : "border-sand bg-sand/10 text-transparent"
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </div>
                <span>{a}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
