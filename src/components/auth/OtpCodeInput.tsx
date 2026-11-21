"use client";

import React, { useEffect, useRef } from "react";

type OtpCodeInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
};

export function OtpCodeInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus = true,
  id = "otp-code",
}: OtpCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.replace(/\D/g, "").slice(0, length).split("");
  while (digits.length < length) digits.push("");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").replace(/\D/g, "").slice(0, length));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5" role="group" aria-label="Verification code">
      <label htmlFor={`${id}-0`} className="text-slate-500">
        Verification code
      </label>
      <div className="flex gap-2 justify-between">
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`${id}-${index}`}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={disabled}
            maxLength={1}
            value={digit}
            aria-label={`Digit ${index + 1}`}
            onPaste={handlePaste}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              if (!raw) {
                setAt(index, "");
                return;
              }
              if (raw.length > 1) {
                onChange(raw.slice(0, length));
                refs.current[Math.min(raw.length, length) - 1]?.focus();
                return;
              }
              setAt(index, raw);
              if (index < length - 1) refs.current[index + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[index] && index > 0) {
                refs.current[index - 1]?.focus();
              }
              if (e.key === "ArrowLeft" && index > 0) {
                e.preventDefault();
                refs.current[index - 1]?.focus();
              }
              if (e.key === "ArrowRight" && index < length - 1) {
                e.preventDefault();
                refs.current[index + 1]?.focus();
              }
            }}
            className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-extrabold bg-slate-50 border border-sand rounded-xl focus:outline-none focus:border-indigo text-charcoal transition-colors disabled:opacity-50"
          />
        ))}
      </div>
    </div>
  );
}
