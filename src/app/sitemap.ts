import type { MetadataRoute } from "next";
import { DESTINATIONS } from "@/features/destinations/data/destinations";
import { destinationSlug } from "@/features/destinations/logic";
import { getSiteOrigin } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/listings", changeFrequency: "hourly", priority: 0.9 },
  { path: "/destinations", changeFrequency: "weekly", priority: 0.8 },
  { path: "/dealers", changeFrequency: "weekly", priority: 0.7 },
  { path: "/services", changeFrequency: "weekly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/help", changeFrequency: "monthly", priority: 0.3 },
  { path: "/api-docs", changeFrequency: "monthly", priority: 0.2 },
  { path: "/llms.txt", changeFrequency: "weekly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((item) => ({
    url: `${origin}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  for (const dest of DESTINATIONS) {
    entries.push({
      url: `${origin}/destinations/${destinationSlug(dest.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  if (!hasSupabaseEnv()) return entries;

  try {
    const supabase = await createClient();
    const { data: properties } = await supabase
      .from("properties")
      .select("id, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(5000);

    for (const row of properties ?? []) {
      entries.push({
        url: `${origin}/property/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const { data: dealers } = await supabase
      .from("directory_profiles")
      .select("id, updated_at")
      .eq("listing_active", true)
      .limit(2000);

    for (const row of dealers ?? []) {
      entries.push({
        url: `${origin}/dealers/${row.id}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Sitemap still returns static + destination URLs if DB is unavailable.
  }

  return entries;
}
