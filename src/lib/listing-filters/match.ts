import type { Property } from "@/types";
import type {
  ListingFilter,
  ListingFilterExtra,
  ListingFilterRangeValue,
} from "@/types/listing-filter";

function readField(property: Property, field: string): unknown {
  return (property as unknown as Record<string, unknown>)[field];
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(" ");
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function isRangeValue(raw: unknown): raw is ListingFilterRangeValue {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw);
}

/** Apply a custom filter against a property field. */
export function matchesCustomListingFilter(
  property: Property,
  def: ListingFilter,
  extra: ListingFilterExtra | undefined
): boolean {
  if (!def.propertyField) return true;
  const raw = extra?.[def.key];
  if (raw == null || raw === "" || raw === false) return true;
  if (Array.isArray(raw) && raw.length === 0) return true;
  if (isRangeValue(raw) && !raw.min && !raw.max) return true;

  const fieldValue = readField(property, def.propertyField);

  if (def.kind === "toggle" || def.kind === "boolean") {
    if (raw === true || raw === "true" || raw === "yes" || raw === "1") {
      return Boolean(fieldValue) === true;
    }
    if (raw === "false" || raw === "no" || raw === "0") {
      return Boolean(fieldValue) === false;
    }
    return true;
  }

  if (def.kind === "multi" || def.kind === "checkbox") {
    const wanted = Array.isArray(raw) ? raw.map(String) : [String(raw)];
    if (wanted.length === 0) return true;
    const haystack = Array.isArray(fieldValue)
      ? fieldValue.map((v) => String(v).toLowerCase())
      : [asText(fieldValue).toLowerCase()];
    return wanted.some((w) => haystack.some((h) => h.includes(w.toLowerCase())));
  }

  if (def.kind === "dropdown") {
    const needle = String(Array.isArray(raw) ? raw[0] : raw).trim().toLowerCase();
    if (!needle) return true;
    if (Array.isArray(fieldValue)) {
      return fieldValue.some((v) => String(v).toLowerCase() === needle);
    }
    return asText(fieldValue).toLowerCase() === needle;
  }

  if (def.kind === "range" || def.kind === "number") {
    const num = asNumber(fieldValue);
    if (num == null) return false;
    if (def.kind === "number") {
      const target = asNumber(Array.isArray(raw) ? raw[0] : raw);
      if (target == null) return true;
      return num === target;
    }
    const range = isRangeValue(raw)
      ? raw
      : { min: String(raw), max: undefined };
    const min = asNumber(range.min);
    const max = asNumber(range.max);
    if (min != null && num < min) return false;
    if (max != null && num > max) return false;
    return true;
  }

  if (def.kind === "date") {
    const needle = String(Array.isArray(raw) ? raw[0] : raw).trim();
    if (!needle) return true;
    const fieldDate = asText(fieldValue).slice(0, 10);
    return fieldDate === needle.slice(0, 10);
  }

  const needle = String(Array.isArray(raw) ? raw[0] : raw).trim().toLowerCase();
  if (!needle) return true;
  return asText(fieldValue).toLowerCase().includes(needle);
}
