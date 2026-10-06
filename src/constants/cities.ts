/** Sentinel for “no city filter” — not a DB location. */
export const ALL_BHARAT_CITY = "All Bharat";

/** Previous sentinel value; still present in saved UI prefs and shared URLs. */
const LEGACY_ALL_CITY = "all india";

export function isAllBharatCity(city: string | null | undefined): boolean {
  const c = city?.trim().toLowerCase();
  return c === ALL_BHARAT_CITY.toLowerCase() || c === LEGACY_ALL_CITY;
}

/**
 * @deprecated Hardcoded city lists are no longer the source of truth.
 * Use admin-managed `locations` via `useActiveCities()` / `/api/locations`.
 * Kept only as a last-resort empty-catalog fallback during bootstrap.
 * Order mirrors default `locations.sort_order`.
 */
export const CITIES = [
  ALL_BHARAT_CITY,
  "Udaipur",
  "Jaipur",
  "Jodhpur",
  "Jaisalmer",
  "Kota",
  "Ahmedabad",
  "Surat",
  "Shimla",
  "Bikaner",
] as const;

export const CITIES_WITHOUT_ALL = CITIES.filter((c) => c !== ALL_BHARAT_CITY);
