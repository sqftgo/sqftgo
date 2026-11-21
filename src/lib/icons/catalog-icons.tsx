"use client";

import {
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  Compass,
  Droplets,
  Dumbbell,
  Fence,
  Flame,
  Flower2,
  Hammer,
  Home,
  KeyRound,
  Landmark,
  Leaf,
  MapPin,
  Paintbrush,
  ParkingSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trees,
  Truck,
  Utensils,
  Waves,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  CATALOG_ICON_NAMES,
  DEFAULT_CATEGORY_ICON,
  isCatalogIconName,
  type CatalogIconName,
} from "@/lib/icons/catalog-icon-names";

export {
  CATALOG_ICON_NAMES,
  DEFAULT_AMENITY_ICON,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_SERVICE_ICON,
  isCatalogIconName,
  type CatalogIconName,
} from "@/lib/icons/catalog-icon-names";

/** Lucide icons available for categories, amenities, and service types. */
export const CATALOG_ICONS: Record<CatalogIconName, LucideIcon> = {
  Home,
  Building2,
  Landmark,
  Store,
  KeyRound,
  MapPin,
  Star,
  Sparkles,
  Shield,
  ShieldCheck,
  Waves,
  Droplets,
  Dumbbell,
  Car,
  ParkingSquare,
  Wifi,
  Flame,
  Leaf,
  Trees,
  Flower2,
  Fence,
  Bath,
  BedDouble,
  Utensils,
  Paintbrush,
  Hammer,
  Wrench,
  Truck,
  Compass,
  Briefcase,
  CheckCircle2,
};

const EMOJI_FALLBACKS: Record<string, CatalogIconName> = {
  "🏠": "Home",
  "🏡": "Home",
  "🏢": "Building2",
  "⭐": "Star",
  "🔧": "Wrench",
  "🛠️": "Hammer",
  "🚗": "Car",
  "🏊": "Waves",
  "💪": "Dumbbell",
  "🌳": "Trees",
  "🔒": "Shield",
  "📶": "Wifi",
};

export function resolveCatalogIconName(
  value?: string | null,
  fallback: CatalogIconName = DEFAULT_CATEGORY_ICON
): CatalogIconName {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (isCatalogIconName(trimmed)) return trimmed;
  if (EMOJI_FALLBACKS[trimmed]) return EMOJI_FALLBACKS[trimmed];
  return fallback;
}

export function tryGetCatalogIcon(value?: string | null): LucideIcon | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (isCatalogIconName(trimmed)) return CATALOG_ICONS[trimmed];
  const fromEmoji = EMOJI_FALLBACKS[trimmed];
  if (fromEmoji) return CATALOG_ICONS[fromEmoji];
  return null;
}

export function getCatalogIcon(
  value?: string | null,
  fallback: CatalogIconName = DEFAULT_CATEGORY_ICON
): LucideIcon {
  return tryGetCatalogIcon(value) ?? CATALOG_ICONS[fallback];
}

export function CatalogIcon({
  name,
  fallback = DEFAULT_CATEGORY_ICON,
  className,
}: {
  name?: string | null;
  fallback?: CatalogIconName;
  className?: string;
}) {
  const Icon = getCatalogIcon(name, fallback);
  return <Icon className={className} aria-hidden />;
}
