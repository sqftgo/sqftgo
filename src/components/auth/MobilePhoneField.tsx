"use client";

import React from "react";
import { Phone } from "lucide-react";
import { countryDigits, nationalDigits, validateMobile } from "@/lib/auth/phone";

export const COUNTRY_OPTIONS = [
  { code: "91", label: "IN +91" },
  { code: "1", label: "US +1" },
  { code: "44", label: "UK +44" },
  { code: "971", label: "AE +971" },
  { code: "65", label: "SG +65" },
] as const;

type MobilePhoneFieldProps = {
  countryCode: string;
  mobileNumber: string;
  onCountryChange: (code: string) => void;
  onMobileChange: (national: string) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
};

export function MobilePhoneField({
  countryCode,
  mobileNumber,
  onCountryChange,
  onMobileChange,
  disabled,
  id = "mobile-number",
  label = "Mobile Number",
  className = "",
}: MobilePhoneFieldProps) {
  const cc = countryDigits(countryCode);
  const national = nationalDigits(cc, mobileNumber);
  const maxLen = cc === "91" ? 10 : 15;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-slate-500">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={cc}
          disabled={disabled}
          onChange={(e) => onCountryChange(countryDigits(e.target.value))}
          className="w-[7.5rem] shrink-0 bg-slate-50 border border-sand rounded-xl py-3 px-2.5 text-charcoal focus:outline-none focus:border-indigo transition-colors cursor-pointer disabled:opacity-50"
        >
          {COUNTRY_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-0">
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            disabled={disabled}
            value={national}
            maxLength={maxLen}
            onChange={(e) =>
              onMobileChange(e.target.value.replace(/\D/g, "").slice(0, maxLen))
            }
            placeholder={cc === "91" ? "10-digit mobile" : "Mobile number"}
            className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30 transition-colors disabled:opacity-50"
          />
          <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export function mobileFieldError(countryCode: string, mobileNumber: string): string | null {
  return validateMobile(countryDigits(countryCode), nationalDigits(countryCode, mobileNumber));
}
