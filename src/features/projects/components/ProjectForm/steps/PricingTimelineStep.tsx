"use client";

import { FormField, TextInput } from "@/components/ui/FormField";
import { formatInr, type ProjectFormValues, type SetProjectField } from "../types";

type Props = {
  form: ProjectFormValues;
  set: SetProjectField;
};

export function PricingTimelineStep({ form, set }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Pricing & Timeline</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Overall price band and expected launch / possession dates.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FormField label="Price from (₹)">
              <TextInput
                type="number"
                min={0}
                value={form.priceFrom ?? ""}
                onChange={(e) =>
                  set("priceFrom", e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="e.g. 2500000"
              />
            </FormField>
            {form.priceFrom != null ? (
              <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1 rounded-lg w-fit">
                {formatInr(form.priceFrom)}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <FormField label="Price to (₹)">
              <TextInput
                type="number"
                min={0}
                value={form.priceTo ?? ""}
                onChange={(e) =>
                  set("priceTo", e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="e.g. 8500000"
              />
            </FormField>
            {form.priceTo != null ? (
              <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1 rounded-lg w-fit">
                {formatInr(form.priceTo)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Launch date">
            <TextInput
              type="date"
              value={form.launchDate ?? ""}
              onChange={(e) => set("launchDate", e.target.value || undefined)}
            />
          </FormField>
          <FormField label="Possession date">
            <TextInput
              type="date"
              value={form.possessionDate ?? ""}
              onChange={(e) => set("possessionDate", e.target.value || undefined)}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
