import type { Amenity, Category, Location } from "@/types";
import type { AmenityRow, CategoryRow, LocationRow } from "@/types/database";

export function mapCategoryRow(row: CategoryRow, count = 0): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    count,
    active: row.active,
  };
}

export function mapLocationRow(row: LocationRow, propertyCount = 0): Location {
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    country: row.country,
    active: row.active,
    propertyCount,
  };
}

export function mapAmenityRow(row: AmenityRow): Amenity {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
  };
}
