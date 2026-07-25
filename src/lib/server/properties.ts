import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapPropertyRow } from "@/lib/mappers/property";
import type { Property } from "@/types";
import type { PropertyRow } from "@/types/database";

/**
 * Server-side property reads for future RSC pages.
 * Client listings still use the BFF + TanStack Query in Phase C.
 */
export async function fetchActivePropertiesPage(opts?: {
  limit?: number;
  offset?: number;
  city?: string;
}): Promise<{ items: Property[]; total: number }> {
  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 100);
  const offset = Math.max(opts?.offset ?? 0, 0);
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts?.city && opts.city !== "All India") {
    query = query.eq("city", opts.city);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    items: ((data as PropertyRow[] | null) ?? []).map(mapPropertyRow),
    total: count ?? 0,
  };
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as PropertyRow;
  if (row.status !== "active") return null;
  return mapPropertyRow(row);
}
