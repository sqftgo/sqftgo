"use client";

import React from "react";
import { MapPin } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";
import { useActiveCities } from "@/hooks/useActiveCities";

type AuthCitySelectProps = {
  cityId: string;
  onChange: (cityId: string, cityName: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
};

export function AuthCitySelect({
  cityId,
  onChange,
  disabled,
  required,
  label = "City",
}: AuthCitySelectProps) {
  const { activeLocations, locationsReady } = useActiveCities();

  const options = activeLocations.map((loc) => ({
    label: loc.state ? `${loc.city}, ${loc.state}` : loc.city,
    value: loc.id,
  }));

  if (!locationsReady) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-slate-500">{label}</span>
        <div className="w-full bg-slate-50 border border-sand rounded-xl py-3 px-4 text-charcoal/40">
          Loading cities…
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-slate-500">{label}</span>
        <div className="w-full bg-rose-50 border border-rose-100 rounded-xl py-3 px-4 text-rose-600 text-[11px] font-semibold">
          No cities available. Ask an admin to activate locations.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-500">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      <div className="relative">
        <CustomSelect
          searchable
          accent="indigo"
          options={options}
          value={cityId}
          placeholder="Search city"
          onChange={(id) => {
            const loc = activeLocations.find((l) => l.id === id);
            onChange(id, loc?.city ?? "");
          }}
          buttonClassName={`w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-10 text-left text-charcoal focus:outline-none ${
            disabled ? "opacity-50 pointer-events-none" : ""
          }`}
        />
        <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40 pointer-events-none z-10" />
      </div>
    </div>
  );
}
