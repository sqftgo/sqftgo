"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { LIFECYCLE_OPTIONS, OWNERSHIP_OPTIONS, selectBtnClass } from "../constants";
import type { ProjectFormValues, SetProjectField } from "../types";
import type { Project } from "@/types";

type Props = {
  form: ProjectFormValues;
  set: SetProjectField;
};

export function BasicInfoStep({ form, set }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Basic Information</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Name the project and how you are related to it.
        </p>
      </div>

      <div className="space-y-4 text-left">
        <FormField
          label="Project Name"
          required
          hint="Use the marketing or society name buyers will recognize."
        >
          <TextInput
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Lakeview Residences"
            maxLength={200}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Your Role" required>
            <CustomSelect
              options={OWNERSHIP_OPTIONS}
              value={form.ownershipRole}
              onChange={(val) => set("ownershipRole", val as Project["ownershipRole"])}
              buttonClassName={selectBtnClass}
            />
          </FormField>

          <FormField label="Project Stage" required>
            <CustomSelect
              options={LIFECYCLE_OPTIONS}
              value={form.lifecycle}
              onChange={(val) => set("lifecycle", val as Project["lifecycle"])}
              buttonClassName={selectBtnClass}
            />
          </FormField>
        </div>

        <FormField label="Description" required>
          <TextArea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Highlights, location advantages, inventory overview…"
            maxLength={20000}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Name" required>
            <TextInput
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              maxLength={120}
            />
          </FormField>
          <FormField label="Contact Phone" required>
            <TextInput
              value={form.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
              maxLength={40}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
