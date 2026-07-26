"use client";

import { PROPERTY_TYPES } from "@/constants";
import CustomSelect from "@/components/ui/CustomSelect";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { PURPOSES, selectBtnClass } from "../constants";
import type { FormState, SetFormField } from "../types";

type BasicInfoStepProps = {
  form: FormState;
  set: SetFormField;
};

export function BasicInfoStep({ form, set }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Basic Information</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Provide the essential details about your property listing.
        </p>
      </div>

      <div className="space-y-4 text-left">
        <FormField
          label="Property Title"
          required
          hint="Make it descriptive and highlight key selling points."
        >
          <TextInput
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Ultra Luxury Lake-Facing Villa"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Property Type" required>
            <CustomSelect
              options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))}
              value={form.type}
              onChange={(val) => set("type", val)}
              buttonClassName={selectBtnClass}
            />
          </FormField>

          <FormField label="Listing Purpose" required>
            <CustomSelect
              options={PURPOSES}
              value={form.purpose}
              onChange={(val) => set("purpose", val)}
              buttonClassName={selectBtnClass}
            />
          </FormField>
        </div>

        <FormField label="Description" required>
          <TextArea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Describe the property, architecture, ventilation, location perks, and design details..."
          />
        </FormField>

        <FormField
          label="RERA ID (Optional)"
          hint="Properties with a valid RERA ID are flagged as verified."
        >
          <TextInput
            value={form.reraId}
            onChange={(e) => set("reraId", e.target.value)}
            placeholder="e.g. RAJ/RERA/P/2023/1204"
          />
        </FormField>
      </div>
    </div>
  );
}
