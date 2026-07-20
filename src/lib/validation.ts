export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function required(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}
