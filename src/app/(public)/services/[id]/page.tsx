import type { Metadata } from "next";
import { isServiceDirectoryCategory } from "@/features/dealers/lib/is-dealer-category";
import { mapDealerRow } from "@/lib/mappers/dealer";
import { looksLikeUuid } from "@/lib/services/profile-slug";
import { DEFAULT_OG_IMAGE, getSiteOrigin, SITE_NAME } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { DirectoryProfileRow } from "@/types/database";
import { ServicePublicProfile } from "@/features/services/components/ServicePublicProfile";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadServiceProfile(idOrSlug: string) {
  if (!hasSupabaseEnv()) return null;
  try {
    // Public SSR must use the anon/user client so RLS still applies (no service-role bypass).
    const supabase = await createClient();
    let q = supabase.from("directory_profiles").select("*");
    q = looksLikeUuid(idOrSlug) ? q.eq("id", idOrSlug) : q.eq("slug", idOrSlug);
    const { data } = await q.maybeSingle();
    if (!data) return null;
    const mapped = mapDealerRow(data as DirectoryProfileRow);
    if (!isServiceDirectoryCategory(mapped.category)) return null;
    return mapped;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await loadServiceProfile(id);
  const origin = getSiteOrigin();

  if (!profile) {
    return {
      title: `Service Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const pathSeg = profile.slug || profile.id;
  const title = `${profile.firmName} · ${profile.category} in ${profile.city} | ${SITE_NAME}`;
  const description =
    (profile.intro || profile.description || "").slice(0, 160) ||
    `${profile.firmName} — ${profile.category} serving ${profile.city}.`;
  const image = profile.coverImageUrl || profile.logoUrl || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${origin}/services/${pathSeg}` },
    openGraph: {
      title,
      description,
      url: `${origin}/services/${pathSeg}`,
      images: [{ url: image }],
      type: "profile",
    },
  };
}

export default async function ServiceProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <ServicePublicProfile profileKey={id} />;
}
