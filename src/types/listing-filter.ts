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
  | "multi";

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

/** Extra values for custom text / toggle / multi filters keyed by filter.key */
export type ListingFilterExtra = Record<string, string | string[] | boolean>;
