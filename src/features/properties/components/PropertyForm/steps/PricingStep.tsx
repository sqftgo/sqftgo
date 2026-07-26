"use client";

import { FormField, TextInput } from "@/components/ui/FormField";
import type { FormState, SetFormField } from "../types";

type PricingStepProps = {
  form: FormState;
  set: SetFormField;
};

export function PricingStep({ form, set }: PricingStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Pricing & Costing</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Specify your listed price and check tax estimations.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="max-w-sm space-y-1.5">
          <FormField label="Listed Price (Γé╣)" required>
            <TextInput
              type="number"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="e.g. 15000000"
            />
          </FormField>
          {form.price ? (
            <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1.5 rounded-lg w-fit">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(parseInt(form.price))}
            </p>
          ) : null}
        </div>

        <div className="bg-sand/15 rounded-3xl p-6 border border-indigo/5 space-y-4">
          <p className="text-[10px] font-black text-charcoal/45 uppercase tracking-widest">
            Pricing Estimation Breakdown
          </p>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-sand/40 pb-2">
              <span className="text-charcoal/60 font-semibold">Base Price</span>
              <span className="text-charcoal font-black">
                Γé╣{form.price ? parseInt(form.price).toLocaleString("en-IN") : "ΓÇö"}
              </span>
            </div>
            <div className="flex justify-between border-b border-sand/40 pb-2">
              <span className="text-charcoal/60 font-semibold flex items-center gap-1">
                Registration & Stamp Duty{" "}
                <span className="text-[10px] text-charcoal/40 font-bold">(Est. 6%)</span>
              </span>
              <span className="text-charcoal/70 font-semibold">
                Γé╣
                {form.price
                  ? Math.round(parseInt(form.price) * 0.06).toLocaleString("en-IN")
                  : "ΓÇö"}
              </span>
            </div>
            <div className="flex justify-between border-b border-sand/40 pb-2">
              <span className="text-charcoal/60 font-semibold flex items-center gap-1">
                Goods & Service Tax{" "}
                <span className="text-[10px] text-charcoal/40 font-bold">(Est. 5%)</span>
              </span>
              <span className="text-charcoal/70 font-semibold">
                Γé╣
                {form.price
                  ? Math.round(parseInt(form.price) * 0.05).toLocaleString("en-IN")
                  : "ΓÇö"}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-indigo font-black text-sm">Estimated Total Cost</span>
              <span className="text-indigo font-black text-sm">
                Γé╣
                {form.price
                  ? Math.round(parseInt(form.price) * 1.11).toLocaleString("en-IN")
                  : "ΓÇö"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
