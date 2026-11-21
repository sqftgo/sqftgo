import { slugify } from "@/lib/slug";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Build a unique directory profile slug from firm name + optional id suffix. */
export async function allocateDirectorySlug(
  supabase: SupabaseClient,
  firmName: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(firmName || "business", 80);
  for (let i = 0; i < 12; i++) {
    const candidate =
      i === 0
        ? base
        : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    let q = supabase
      .from("directory_profiles")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}