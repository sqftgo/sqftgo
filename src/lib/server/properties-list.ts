import "server-only";

import { clampPageParams } from "@/lib/api/client";
import { toDbStatus } from "@/lib/mappers/property";
import { propertyStatusUiSchema } from "@/lib/validation/property";
import type { PropertyPurposeDb, PropertyTypeDb } from "@/types/database";

export function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function sanitizeSearch(raw: string): string {
  return raw.replace(/[%_,.()']/g, " ").trim().slice(0, 80);
}

export type PropertyListParams = {
  mine: boolean;
  statusParam: string | null;
  city: string | undefined;
  type: string | undefined;
  purpose: string | undefined;
  featuredParam: string | null;
  searchRaw: string | undefined;
  ownerEmail: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  limit: number;
  offset: number;
};

export function parsePropertyListParams(
  searchParams: URLSearchParams
): PropertyListParams {
  const mine =
    searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const statusParam = searchParams.get("status");
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const purpose = searchParams.get("purpose") ?? undefined;
  const featuredParam = searchParams.get("featured");
  const searchRaw = searchParams.get("search")?.trim() ?? undefined;
  const ownerEmail =
    searchParams.get("ownerEmail")?.trim().toLowerCase() ?? undefined;
  const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
  const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));
  const { limit, offset } = clampPageParams(
    searchParams.get("limit"),
    searchParams.get("offset"),
    { limit: 100, maxLimit: 200 }
  );

  return {
    mine,
    statusParam,
    city,
    type,
    purpose,
    featuredParam,
    searchRaw,
    ownerEmail,
    minPrice,
    maxPrice,
    limit,
    offset,
  };
}

export type PropertyListFilterInput = Pick<
  PropertyListParams,
  | "statusParam"
  | "city"
  | "type"
  | "purpose"
  | "featuredParam"
  | "searchRaw"
  | "minPrice"
  | "maxPrice"
>;

/** Loose chain surface so Postgrest builders stay typed as `T` at the call site. */
type FilterChain = {
  eq: (column: string, value: unknown) => FilterChain;
  gte: (column: string, value: number) => FilterChain;
  lte: (column: string, value: number) => FilterChain;
  or: (filters: string) => FilterChain;
};

export function applyPropertyListFilters<T>(
  query: T,
  filters: PropertyListFilterInput
): { query: T } | { error: string } {
  let next = query as unknown as FilterChain;
  const {
    statusParam,
    city,
    type,
    purpose,
    featuredParam,
    searchRaw,
    minPrice,
    maxPrice,
  } = filters;

  if (statusParam && statusParam !== "all") {
    const parsed = propertyStatusUiSchema.safeParse(statusParam);
    if (!parsed.success) return { error: "Invalid status filter" };
    next = next.eq("status", toDbStatus(parsed.data));
  }
  if (city && city !== "All India") next = next.eq("city", city);
  if (type && type !== "any") next = next.eq("type", type as PropertyTypeDb);
  if (purpose) next = next.eq("purpose", purpose as PropertyPurposeDb);
  if (featuredParam === "true") next = next.eq("featured", true);
  if (featuredParam === "false") next = next.eq("featured", false);
  if (minPrice !== undefined) next = next.gte("price", minPrice);
  if (maxPrice !== undefined) next = next.lte("price", maxPrice);
  if (searchRaw) {
    const search = sanitizeSearch(searchRaw);
    if (search) {
      next = next.or(
        `title.ilike.%${search}%,locality.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
  }

  return { query: next as unknown as T };
}
