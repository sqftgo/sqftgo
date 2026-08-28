/** Sentinel for “no city filter” — not a DB location. */
export const ALL_INDIA_CITY = "All India";

/**
 * @deprecated Hardcoded city lists are no longer the source of truth.
 * Use admin-managed `locations` via `useActiveCities()` / `/api/locations`.
 * Kept only as a last-resort empty-catalog fallback during bootstrap.
 */
export const CITIES = [
  ALL_INDIA_CITY,
  "Udaipur",
  "Jaipur",
  "Jodhpur",
  "Kota",
  "Jaisalmer",
  "Ahmedabad",
  "Surat",
  "Bikaner",
  "Shimla",
] as const;

export const CITIES_WITHOUT_ALL = CITIES.filter((c) => c !== ALL_INDIA_CITY);
