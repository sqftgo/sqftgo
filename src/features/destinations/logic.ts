import type { Property } from "@/types";
import { ALL_INDIA_CITY } from "@/constants/cities";
import { DESTINATIONS, TAGS, type Destination } from "./data/destinations";

export type DestinationSortBy =
  | "recommended"
  | "properties"
  | "score"
  | "name"
  | "wedding";

export type CityCountMap = Record<string, number>;

export function destinationSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function findDestinationBySlug(slug: string): Destination | undefined {
  const normalized = decodeURIComponent(slug).trim().toLowerCase().replace(/\s+/g, "-");
  return DESTINATIONS.find((d) => destinationSlug(d.name) === normalized);
}

export function destinationListingsHref(name: string): string {
  return `/listings?city=${encodeURIComponent(name)}`;
}

export function weddingInventoryCount(dest: Destination): number {
  return (dest.weddingVenues?.length || 0) + (dest.uniqueWeddingProperties?.length || 0);
}

export function parseGrowthScore(investmentIndex: string | undefined): number {
  if (!investmentIndex) return 0;
  const n = parseFloat(investmentIndex.split("/")[0] || "0");
  return Number.isFinite(n) ? n : 0;
}

export function countActiveListingsByCity(properties: Property[]): CityCountMap {
  const counts: CityCountMap = {};
  for (const p of properties) {
    if (p.status !== "Active") continue;
    const city = p.city.trim().toLowerCase();
    if (!city) continue;
    counts[city] = (counts[city] || 0) + 1;
  }
  return counts;
}

export function listingsInDestination(
  properties: Property[],
  cityName: string,
  limit?: number
): Property[] {
  const city = cityName.trim().toLowerCase();
  const matches = properties.filter(
    (p) => p.status === "Active" && p.city.trim().toLowerCase() === city
  );
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

export function averageGrowthScore(destinations: Destination[] = DESTINATIONS): string {
  const scores = destinations.map((d) => parseGrowthScore(d.investmentIndex)).filter((s) => s > 0);
  if (scores.length === 0) return "N/A";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return `${avg.toFixed(1)}/10`;
}

export function totalWeddingHotspots(destinations: Destination[] = DESTINATIONS): number {
  return destinations.reduce((acc, d) => acc + weddingInventoryCount(d), 0);
}

export function countListingsInDestinations(
  properties: Property[],
  destinations: Destination[] = DESTINATIONS
): number {
  const cities = new Set(destinations.map((d) => d.name.trim().toLowerCase()));
  return properties.filter(
    (p) => p.status === "Active" && cities.has(p.city.trim().toLowerCase())
  ).length;
}

/**
 * Navbar city → destination region tag.
 * Prefer the static destination catalog, then admin locations.state when it matches a tag.
 */
export function regionForSelectedCity(
  selectedCity: string,
  locations: { city: string; state: string }[] = []
): string {
  const city = selectedCity.trim();
  if (!city || city.toLowerCase() === ALL_INDIA_CITY.toLowerCase()) return "All";

  const dest = DESTINATIONS.find((d) => d.name.toLowerCase() === city.toLowerCase());
  if (dest) return dest.tag;

  const loc = locations.find((l) => l.city.toLowerCase() === city.toLowerCase());
  if (loc?.state) {
    const tag = TAGS.find(
      (t) => t !== "All" && t.toLowerCase() === loc.state.trim().toLowerCase()
    );
    if (tag) return tag;
  }

  return "All";
}

export function tagStatsForDestinations(
  cityPropertiesMap: CityCountMap,
  destinations: Destination[] = DESTINATIONS
): Record<string, { cities: number; listings: number }> {
  const stats: Record<string, { cities: number; listings: number }> = {};
  for (const tag of TAGS) {
    const cities = tag === "All" ? destinations : destinations.filter((d) => d.tag === tag);
    const listings = cities.reduce(
      (acc, c) => acc + (cityPropertiesMap[c.name.toLowerCase()] || 0),
      0
    );
    stats[tag] = { cities: cities.length, listings };
  }
  return stats;
}

export function filterDestinations(args: {
  destinations?: Destination[];
  activeFilter: string;
  selectedCityRegion: string;
  limitToSelectedCityRegion: boolean;
  onlyWeddingDestinations: boolean;
}): Destination[] {
  const destinations = args.destinations ?? DESTINATIONS;
  return destinations.filter((d) => {
    const matchesRegion =
      !args.limitToSelectedCityRegion ||
      args.selectedCityRegion === "All" ||
      d.tag === args.selectedCityRegion;
    const matchesTag = args.activeFilter === "All" || d.tag === args.activeFilter;
    const matchesWedding =
      !args.onlyWeddingDestinations || weddingInventoryCount(d) > 0;
    return matchesRegion && matchesTag && matchesWedding;
  });
}

export function sortDestinations(
  list: Destination[],
  sortBy: DestinationSortBy,
  cityPropertiesMap: CityCountMap
): Destination[] {
  const sorted = [...list];
  if (sortBy === "properties") {
    sorted.sort(
      (a, b) =>
        (cityPropertiesMap[b.name.toLowerCase()] || 0) -
        (cityPropertiesMap[a.name.toLowerCase()] || 0)
    );
  } else if (sortBy === "score") {
    sorted.sort((a, b) => parseGrowthScore(b.investmentIndex) - parseGrowthScore(a.investmentIndex));
  } else if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "wedding") {
    sorted.sort((a, b) => weddingInventoryCount(b) - weddingInventoryCount(a));
  } else {
    sorted.sort((a, b) => recommendedScore(b, cityPropertiesMap) - recommendedScore(a, cityPropertiesMap));
  }
  return sorted;
}

function recommendedScore(dest: Destination, cityPropertiesMap: CityCountMap): number {
  const listings = cityPropertiesMap[dest.name.toLowerCase()] || 0;
  return listings * 2 + weddingInventoryCount(dest) * 3 + parseGrowthScore(dest.investmentIndex);
}
