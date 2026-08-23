import type { ListingFilter } from "@/types/listing-filter";

/** Fallback when the catalog API is unreachable — matches the seeded system filters. */
export const DEFAULT_LISTING_FILTERS: ListingFilter[] = [
  { id: "purpose", key: "purpose", label: "Purpose", kind: "purpose", propertyField: "purpose", options: [], active: true, system: true, sortOrder: 10 },
  { id: "city", key: "city", label: "City", kind: "city", propertyField: "city", catalog: "cities", options: [], active: true, system: true, sortOrder: 20 },
  { id: "locality", key: "locality", label: "Locality", kind: "locality", propertyField: "locality", options: [], active: true, system: true, sortOrder: 30 },
  { id: "type", key: "type", label: "Property Type", kind: "type", propertyField: "type", catalog: "categories", options: [], active: true, system: true, sortOrder: 40 },
  { id: "bhk", key: "bhk", label: "BHK Size", kind: "bhk", propertyField: "bhk", options: [
    { label: "1 BHK", value: "1" },
    { label: "2 BHK", value: "2" },
    { label: "3 BHK", value: "3" },
    { label: "4 BHK", value: "4" },
  ], active: true, system: true, sortOrder: 50 },
  { id: "price", key: "price", label: "Budget Price", kind: "price", propertyField: "price", options: [], active: true, system: true, sortOrder: 60 },
  { id: "size", key: "size", label: "Property Size (sq.ft.)", kind: "size", propertyField: "size", options: [], active: true, system: true, sortOrder: 70 },
  { id: "furnishing", key: "furnishing", label: "Furnishing", kind: "furnishing", propertyField: "furnished", options: [
    { label: "Furnished", value: "Furnished" },
    { label: "Semi-Furnished", value: "Semi-Furnished" },
    { label: "Unfurnished", value: "Unfurnished" },
  ], active: true, system: true, sortOrder: 80 },
  { id: "amenities", key: "amenities", label: "Amenities", kind: "amenities", propertyField: "amenities", catalog: "amenities", options: [], active: true, system: true, sortOrder: 90 },
  { id: "rera", key: "rera", label: "RERA Registered Only", kind: "rera", propertyField: "reraApproved", options: [], active: true, system: true, sortOrder: 100 },
  { id: "featured", key: "featured", label: "Featured Collection Only", kind: "featured", propertyField: "featured", options: [], active: true, system: true, sortOrder: 110 },
];

export const HEADER_FILTER_KEYS = new Set(["city", "locality", "type", "purpose", "price"]);

export function isListingFilterOn(filters: ListingFilter[], key: string): boolean {
  const match = filters.find((f) => f.key === key);
  return match ? match.active : false;
}

export function activeListingFilters(filters: ListingFilter[]): ListingFilter[] {
  return filters.filter((f) => f.active).sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}
