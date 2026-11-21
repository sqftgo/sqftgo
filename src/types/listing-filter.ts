export type ListingFilterKind =
  | "purpose"
  | "city"
  | "locality"
  | "type"
  | "bhk"
  | "furnishing"
  | "price"
  | "size"
  | "amenities"
  | "rera"
  | "featured"
  | "text"
  | "toggle"
  | "multi"
  | "dropdown"
  | "checkbox"
  | "range"
  | "boolean"
  | "number"
  | "date";

export type ListingFilterCatalog = "cities" | "categories" | "amenities";

export type ListingFilterOption = {
  label: string;
  value: string;
};

export type ListingFilter = {
  id: string;
  key: string;
  label: string;
  kind: ListingFilterKind;
  propertyField?: string;
  catalog?: ListingFilterCatalog;
  options: ListingFilterOption[];
  active: boolean;
  system: boolean;
  sortOrder: number;
};

export type ListingFilterRangeValue = { min?: string; max?: string };

/** Extra values for custom filters keyed by filter.key */
export type ListingFilterExtra = Record<
  string,
  string | string[] | boolean | ListingFilterRangeValue
>;

/** Custom (admin-created) filter kinds that map onto property fields. */
export const CUSTOM_LISTING_FILTER_KINDS: ListingFilterKind[] = [
  "text",
  "toggle",
  "multi",
  "dropdown",
  "checkbox",
  "range",
  "boolean",
  "number",
  "date",
];

export function isCustomListingFilterKind(kind: ListingFilterKind): boolean {
  return CUSTOM_LISTING_FILTER_KINDS.includes(kind);
}
