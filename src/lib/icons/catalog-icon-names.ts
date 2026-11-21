/** Lucide icon names allowed for marketplace taxonomy (categories, amenities, services). */
export const CATALOG_ICON_NAMES = [
  "Home",
  "Building2",
  "Landmark",
  "Store",
  "KeyRound",
  "MapPin",
  "Star",
  "Sparkles",
  "Shield",
  "ShieldCheck",
  "Waves",
  "Droplets",
  "Dumbbell",
  "Car",
  "ParkingSquare",
  "Wifi",
  "Flame",
  "Leaf",
  "Trees",
  "Flower2",
  "Fence",
  "Bath",
  "BedDouble",
  "Utensils",
  "Paintbrush",
  "Hammer",
  "Wrench",
  "Truck",
  "Compass",
  "Briefcase",
  "CheckCircle2",
] as const;

export type CatalogIconName = (typeof CATALOG_ICON_NAMES)[number];

export const DEFAULT_CATEGORY_ICON: CatalogIconName = "Home";
export const DEFAULT_AMENITY_ICON: CatalogIconName = "Star";
export const DEFAULT_SERVICE_ICON: CatalogIconName = "Wrench";

export function isCatalogIconName(value: string): value is CatalogIconName {
  return (CATALOG_ICON_NAMES as readonly string[]).includes(value);
}
