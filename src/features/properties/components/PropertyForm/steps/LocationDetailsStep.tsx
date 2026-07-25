"use client";

import { CITIES_WITHOUT_ALL, FURNISHING_OPTIONS } from "@/constants";
import { CustomSelect, FormField, TextInput, SearchInput } from "@/components/ui";
import { labelClassName, selectBtnClass } from "../constants";
import type { FormState, SetFormField } from "../types";

type LocationDetailsStepProps = {
  form: FormState;
  set: SetFormField;
};

export function LocationDetailsStep({ form, set }: LocationDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Location & Details</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Provide the physical address, dimensions, and specifications.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="City" required>
            <CustomSelect
              options={CITIES_WITHOUT_ALL.map((c) => ({ label: c, value: c }))}
              value={form.city}
              onChange={(val) => set("city", val)}
              searchable
              buttonClassName={selectBtnClass}
            />
          </FormField>

          <FormField label="Locality / Area" required>
            <SearchInput
              value={form.locality}
              onChange={(val) => set("locality", val)}
              placeholder="e.g. Lake Palace Road, Fatehsagar"
              accent="terracotta"
              containerClassName="w-full min-w-0"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="State">
            <TextInput
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="e.g. Rajasthan"
            />
          </FormField>

          <FormField label="Area (sq.ft.)" required>
            <TextInput
              type="number"
              value={form.size}
              onChange={(e) => set("size", e.target.value)}
              placeholder="e.g. 2400"
            />
          </FormField>

          <FormField label="Furnishing" required>
            <CustomSelect
              options={[...FURNISHING_OPTIONS].map((f) => ({ label: f, value: f }))}
              value={form.furnished}
              onChange={(val) => set("furnished", val)}
              buttonClassName={selectBtnClass}
            />
          </FormField>
        </div>

        <div>
          <label className="text-[10px] font-black text-indigo/60 uppercase tracking-widest block mb-3">
            Specification Details
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sand/10 border border-indigo/5 p-4 rounded-2xl">
            {(
              [
                ["bhk", "BHK", "3"],
                ["bathrooms", "Bathrooms", "2"],
                ["parking", "Parking", "2"],
                ["yearBuilt", "Year Built", "2020"],
              ] as const
            ).map(([key, label, ph]) => (
              <div key={key} className="flex flex-col gap-1.5 text-left">
                <label className={labelClassName}>{label}</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={`e.g. ${ph}`}
                  className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
