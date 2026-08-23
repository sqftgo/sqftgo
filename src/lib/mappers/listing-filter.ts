import type { ListingFilter, ListingFilterKind, ListingFilterOption } from "@/types/listing-filter";
import type { ListingFilterInsert, ListingFilterRow, ListingFilterUpdate } from "@/types/database";

function parseOptions(raw: ListingFilterRow["options"]): ListingFilterOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const rec = item as Record<string, unknown>;
    const label = typeof rec.label === "string" ? rec.label.trim() : "";
    const value = typeof rec.value === "string" ? rec.value.trim() : "";
    if (!label || !value) return [];
    return [{ label, value }];
  });
}

export function mapListingFilterRow(row: ListingFilterRow): ListingFilter {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    kind: row.kind as ListingFilterKind,
    propertyField: row.property_field ?? undefined,
    catalog: row.catalog ?? undefined,
    options: parseOptions(row.options),
    active: row.active,
    system: row.system,
    sortOrder: row.sort_order,
  };
}

export function mapListingFilterCreate(input: {
  key: string;
  label: string;
  kind: ListingFilterKind;
  propertyField?: string | null;
  catalog?: ListingFilter["catalog"] | null;
  options?: ListingFilterOption[];
  active?: boolean;
  sortOrder?: number;
}): ListingFilterInsert {
  return {
    key: input.key,
    label: input.label,
    kind: input.kind,
    property_field: input.propertyField ?? null,
    catalog: input.catalog ?? null,
    options: input.options ?? [],
    active: input.active ?? true,
    system: false,
    sort_order: input.sortOrder ?? 200,
  };
}

export function mapListingFilterPatch(input: {
  label?: string;
  kind?: ListingFilterKind;
  propertyField?: string | null;
  catalog?: ListingFilter["catalog"] | null;
  options?: ListingFilterOption[];
  active?: boolean;
  sortOrder?: number;
}): ListingFilterUpdate {
  const patch: ListingFilterUpdate = {};
  if (input.label !== undefined) patch.label = input.label;
  if (input.kind !== undefined) patch.kind = input.kind;
  if (input.propertyField !== undefined) patch.property_field = input.propertyField;
  if (input.catalog !== undefined) patch.catalog = input.catalog;
  if (input.options !== undefined) patch.options = input.options;
  if (input.active !== undefined) patch.active = input.active;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  return patch;
}
