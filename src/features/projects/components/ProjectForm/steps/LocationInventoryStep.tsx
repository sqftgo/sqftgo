"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { FormField, TextInput } from "@/components/ui/FormField";
import { SearchInput } from "@/components/ui/SearchInput";
import { useActiveCities } from "@/hooks/useActiveCities";
import {
  PROJECT_PROPERTY_TYPE_OPTIONS,
  configurationOptionsForTypes,
  pruneConfigurations,
  sizeFieldCopy,
} from "@/features/projects/lib/inventoryOptions";
import { selectBtnClass } from "../constants";
import type { ProjectFormValues, SetProjectField } from "../types";

type Props = {
  form: ProjectFormValues;
  set: SetProjectField;
  setForm: Dispatch<SetStateAction<ProjectFormValues>>;
};

export function LocationInventoryStep({ form, set, setForm }: Props) {
  const { cityOptionsWithoutAll, findLocation, locationsReady } = useActiveCities();
  const configOptions = useMemo(
    () => configurationOptionsForTypes(form.propertyTypes),
    [form.propertyTypes],
  );
  const sizeCopy = useMemo(() => sizeFieldCopy(form.propertyTypes), [form.propertyTypes]);

  const toggleType = (value: string) => {
    setForm((prev) => {
      const propertyTypes = prev.propertyTypes.includes(value)
        ? prev.propertyTypes.filter((x) => x !== value)
        : [...prev.propertyTypes, value];
      return {
        ...prev,
        propertyTypes,
        configurations: pruneConfigurations(propertyTypes, prev.configurations),
      };
    });
  };

  const toggleConfig = (value: string) => {
    setForm((prev) => ({
      ...prev,
      configurations: prev.configurations.includes(value)
        ? prev.configurations.filter((x) => x !== value)
        : [...prev.configurations, value],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Location & Inventory</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Where the project sits, and what unit types you are marketing.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="City" required>
            <CustomSelect
              options={cityOptionsWithoutAll}
              value={form.city}
              onChange={(val) => {
                set("city", val);
                const loc = findLocation(val);
                if (loc) {
                  set("state", loc.state);
                  set("country", loc.country || "India");
                }
              }}
              searchable
              placeholder={locationsReady ? "Select city" : "Loading cities…"}
              buttonClassName={selectBtnClass}
            />
          </FormField>

          <FormField label="Locality / Area" required>
            <SearchInput
              value={form.locality}
              onChange={(val) => set("locality", val)}
              placeholder="e.g. Fateh Sagar, Hiran Magri"
              accent="terracotta"
              containerClassName="w-full min-w-0"
            />
          </FormField>
        </div>

        <FormField label="State">
          <TextInput
            value={form.state ?? ""}
            onChange={(e) => set("state", e.target.value)}
            placeholder="e.g. Rajasthan"
          />
        </FormField>

        <div>
          <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest mb-3">
            Inventory in this project *
          </p>
          <p className="text-[11px] font-semibold text-charcoal/45 mb-3">
            Apartments, shops, plots/colony land — or a mix. Configurations and size labels follow
            what you pick.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_PROPERTY_TYPE_OPTIONS.map((opt) => {
              const active = form.propertyTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleType(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    active
                      ? "bg-indigo text-white border-indigo shadow-sm shadow-indigo/15"
                      : "bg-white text-charcoal/70 border-sand hover:border-indigo/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest mb-3">
            Configurations
          </p>
          {configOptions.length === 0 ? (
            <p className="text-xs font-semibold text-charcoal/40">
              Select property types first to see BHK, shop, or plot options.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {configOptions.map((opt) => {
                const active = form.configurations.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleConfig(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      active
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-white text-charcoal/70 border-sand hover:border-indigo/40"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={sizeCopy.fromLabel}>
            <TextInput
              type="number"
              min={0}
              value={form.sizeFrom ?? ""}
              onChange={(e) =>
                set("sizeFrom", e.target.value === "" ? undefined : Number(e.target.value))
              }
              placeholder="e.g. 350"
            />
          </FormField>
          <FormField label={sizeCopy.toLabel}>
            <TextInput
              type="number"
              min={0}
              value={form.sizeTo ?? ""}
              onChange={(e) =>
                set("sizeTo", e.target.value === "" ? undefined : Number(e.target.value))
              }
              placeholder="e.g. 1450"
            />
          </FormField>
        </div>
        <p className="text-[11px] font-semibold text-charcoal/45 -mt-2">{sizeCopy.hint}</p>
      </div>
    </div>
  );
}
