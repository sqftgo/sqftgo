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
          <FormField label="Listed Price (in ₹)" required>
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


      </div>
    </div>
  );
}
