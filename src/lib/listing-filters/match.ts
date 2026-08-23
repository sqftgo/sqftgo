import type { Property } from "@/types";
import type { ListingFilter, ListingFilterExtra } from "@/types/listing-filter";

function readField(property: Property, field: string): unknown {
  return (property as unknown as Record<string, unknown>)[field];
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(" ");
  return String(value);
}

/** Apply a custom text / toggle / multi filter against a property field. */
export function matchesCustomListingFilter(
  property: Property,
  def: ListingFilter,
  extra: ListingFilterExtra | undefined
): boolean {
  if (!def.propertyField) return true;
  const raw = extra?.[def.key];
  if (raw == null || raw === "" || raw === false) return true;
  if (Array.isArray(raw) && raw.length === 0) return true;

  const fieldValue = readField(property, def.propertyField);

  if (def.kind === "toggle") {
    return Boolean(fieldValue) === true;
  }

  if (def.kind === "multi") {
    const wanted = Array.isArray(raw) ? raw.map(String) : [String(raw)];
    if (wanted.length === 0) return true;
    const haystack = Array.isArray(fieldValue)
      ? fieldValue.map((v) => String(v).toLowerCase())
      : [asText(fieldValue).toLowerCase()];
    return wanted.some((w) => haystack.some((h) => h.includes(w.toLowerCase())));
  }

  const needle = String(Array.isArray(raw) ? raw[0] : raw).trim().toLowerCase();
  if (!needle) return true;
  return asText(fieldValue).toLowerCase().includes(needle);
}
