import type { Metadata } from "next";
import { mapPropertyRow } from "@/lib/mappers/property";
import { JsonLd, realEstateListingJsonLd } from "@/lib/seo/json-ld";
import { DEFAULT_OG_IMAGE, getSiteOrigin, SITE_NAME } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { PropertyRow } from "@/types/database";
import PropertyDetailClient from "./PropertyDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadActiveProperty(id: string) {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    if (!data) return null;
    return mapPropertyRow(data as PropertyRow);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await loadActiveProperty(id);
  const origin = getSiteOrigin();

  if (!property) {
    return {
      title: `Property Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const title =
    property.seoTitle?.trim() ||
    `${property.title} in ${property.city} | ${SITE_NAME}`;
  const description =
    property.seoDescription?.trim() ||
    property.description?.slice(0, 160) ||
    `${property.type} for ${property.purpose} in ${property.locality}, ${property.city}.`;
  const image = property.images?.[0] || DEFAULT_OG_IMAGE;
  const canonical = `${origin}/property/${property.id}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await loadActiveProperty(id);

  return (
    <>
      {property ? (
        <JsonLd
          data={realEstateListingJsonLd({
            id: property.id,
            title: property.title,
            description: property.description || property.title,
            price: property.price,
            city: property.city,
            locality: property.locality,
            images: property.images ?? [],
            purpose: property.purpose,
          })}
        />
      ) : null}
      <PropertyDetailClient id={id} />
    </>
  );
}
