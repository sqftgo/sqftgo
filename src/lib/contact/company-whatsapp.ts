/** Public SqftGo WhatsApp. Admin support phone overrides this when it is set. */
export const DEFAULT_SQFTGO_WHATSAPP_DIGITS = "918854065069";

export function whatsappDigits(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11) return digits;
  return DEFAULT_SQFTGO_WHATSAPP_DIGITS;
}

export function companyWhatsappUrl(message: string, phone?: string | null): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}
