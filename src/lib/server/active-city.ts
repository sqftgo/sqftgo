import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedActiveCity = {
  city: string;
  state: string;
  country: string;
};

/**
 * Resolve a city string to the canonical active admin location.
 * Uses the partial index on lower(city) WHERE active for cheap lookups under traffic.
 */
export async function resolveActiveCity(
  supabase: SupabaseClient,
  rawCity: string
): Promise<ResolvedActiveCity | null> {
  const city = rawCity.trim();
  if (city.length < 2 || city.toLowerCase() === "all india") return null;

  const { data, error } = await supabase
    .from("locations")
    .select("city, state, country")
    .eq("active", true)
    .ilike("city", city)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  // ilike can over-match; require exact case-insensitive equality.
  if (data.city.toLowerCase() !== city.toLowerCase()) return null;

  return {
    city: data.city,
    state: data.state,
    country: data.country,
  };
}

export async function requireActiveCity(
  supabase: SupabaseClient,
  rawCity: string
): Promise<{ ok: true; location: ResolvedActiveCity } | { ok: false; error: string }> {
  const location = await resolveActiveCity(supabase, rawCity);
  if (!location) {
    return {
      ok: false,
      error:
        "City must be an active platform location. Ask an admin to add it in Locations first.",
    };
  }
  return { ok: true, location };
}
