"use client";

import React from "react";
import {
  CATALOG_ICON_NAMES,
  CatalogIcon,
  type CatalogIconName,
} from "@/lib/icons/catalog-icons";
import { cn } from "@/lib/cn";

type CatalogIconPickerProps = {
  value: string;
  onChange: (icon: CatalogIconName) => void;
  label?: string;
};

export function CatalogIconPicker({
  value,
  onChange,
  label = "Icon",
}: CatalogIconPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">
        {label}
      </p>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto rounded-xl border border-indigo/10 bg-cream/40 p-2">
        {CATALOG_ICON_NAMES.map((name) => {
          const selected = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              aria-label={name}
              aria-pressed={selected}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                selected
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-white text-indigo/70 hover:bg-indigo/5 hover:text-indigo"
              )}
            >
              <CatalogIcon name={name} className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      <p className="text-[10px] font-semibold text-charcoal/40">{value || "Select an icon"}</p>
    </div>
  );
}

export default CatalogIconPicker;
