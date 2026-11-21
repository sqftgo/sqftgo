/** National number + calling code helpers for mobile auth routes. */

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function countryDigits(countryCode: string | null | undefined): string {
  const digits = digitsOnly(countryCode);
  return digits || "91";
}

/** Strip a leading calling code when the stored value still includes it. */
export function nationalDigits(
  countryCode: string | null | undefined,
  raw: string | null | undefined
): string {
  const cc = countryDigits(countryCode);
  let digits = digitsOnly(raw);
  if (cc === "91" && /^91[6-9][0-9]{9}$/.test(digits)) {
    digits = digits.slice(2);
  } else if (
    cc !== "91" &&
    digits.startsWith(cc) &&
    digits.length - cc.length >= 6 &&
    digits.length - cc.length <= 15
  ) {
    digits = digits.slice(cc.length);
  }
  return digits;
}

/** Returns an error message, or null when valid. */
export function validateMobile(countryCode: string, raw: string): string | null {
  const country = countryDigits(countryCode);
  const national = nationalDigits(country, raw);
  if (!/^[0-9]{1,4}$/.test(country)) return "Choose a valid country code.";
  if (country === "91") {
    if (!/^[6-9][0-9]{9}$/.test(national)) return "Enter a 10-digit Indian mobile number.";
    return null;
  }
  if (!/^[0-9]{6,15}$/.test(national)) return "Enter a valid mobile number.";
  return null;
}

export function toE164Digits(countryCode: string, national: string): string {
  return `${countryDigits(countryCode)}${nationalDigits(countryCode, national)}`;
}
