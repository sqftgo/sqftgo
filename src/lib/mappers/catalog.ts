import type { Amenity, Category, Location } from "@/types";
import type { AmenityRow, CategoryRow, LocationRow } from "@/types/database";
import {
  DEFAULT_AMENITY_ICON,
  DEFAULT_CATEGORY_ICON,
} from "@/lib/icons/catalog-icon-names";
import { slugify } from "@/lib/slug";

export function mapCategoryRow(row: CategoryRow, count = 0): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || slugify(row.name),
    description: row.description ?? "",
    icon: row.icon || DEFAULT_CATEGORY_ICON,
    imageUrl: row.image_url ?? null,
    count,
    active: row.active,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLocationRow(row: LocationRow, propertyCount = 0): Location {
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    country: row.country,
    slug: row.slug || slugify(`${row.city}-${row.state}`),
    active: row.active,
    propertyCount,
    sortOrder: row.sort_order ?? 0,
    coverImageUrl: row.cover_image_url ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAmenityRow(row: AmenityRow): Amenity {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    icon: row.icon || DEFAULT_AMENITY_ICON,
    category: row.category ?? null,
    active: row.active,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
