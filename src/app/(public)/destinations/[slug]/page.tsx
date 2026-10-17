import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import {
  DESTINATIONS,
  destinationSlug,
  destinationsForProvidedCities,
  findDestinationBySlug,
} from "@/features/destinations/logic";
import CityPageLayout from "@/features/destinations/components/CityPageLayout";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { listActiveLocations } from "@/lib/server/active-city";
import { JsonLd, cityPlaceJsonLd } from "@/lib/seo/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: destinationSlug(d.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await resolveProvidedDestination(slug);
  if (!destination) {
    return { title: { absolute: "Destination Not Found | SqftGo" }, robots: { index: false } };
  }
  const title = `${destination.name} | ${destination.title} | SqftGo`;
  return {
    title: { absolute: title },
    description: destination.desc,
    openGraph: {
      title,
      description: destination.desc,
      images: destination.image ? [{ url: destination.image }] : undefined,
    },
  };
}

async function resolveProvidedDestination(slug: string) {
  const raw = findDestinationBySlug(slug);
  if (!raw) return null;

  let locations: { city: string; state: string }[] = [];
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      locations = await listActiveLocations(supabase);
    } catch {
      locations = [];
    }
  }

  const catalog = destinationsForProvidedCities(locations);
  return (
    catalog.find((d) => destinationSlug(d.name) === destinationSlug(raw.name)) ?? null
  );
}

export default async function CityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await resolveProvidedDestination(slug);

  if (!destination) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] bg-cream/30">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-indigo mb-2">Destination Not Found</h2>
        <p className="text-sm text-charcoal/70 mb-8 max-w-md text-center">
          The destination &quot;{slug}&quot; you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/destinations"
          className="px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
        >
          Back to All Destinations
        </Link>
      </div>
    );
  }

  let providedDestinations = destinationsForProvidedCities([]);
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      providedDestinations = destinationsForProvidedCities(await listActiveLocations(supabase));
    } catch {
      // keep fallback catalog
    }
  }

  return (
    <>
      <JsonLd
        data={cityPlaceJsonLd({
          slug,
          name: destination.name,
          title: destination.title,
          description: destination.desc,
          history: destination.history,
          region: destination.tag,
          localities: destination.topLocalities,
          averagePrice: destination.averagePrice,
        })}
      />
      <section className="mx-auto max-w-4xl px-6 pt-28 text-left">
        <h1 className="font-serif text-3xl font-black text-indigo">
          {destination.name} property facts
        </h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-charcoal/80">{destination.desc}</p>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{destination.history}</p>
        <p className="mt-2 text-sm font-semibold text-charcoal/80">
          Localities: {destination.topLocalities.join(", ")}. Typical range: {destination.averagePrice}.
        </p>
      </section>
      <CityPageLayout
        destination={destination}
        providedDestinations={providedDestinations}
      />
    </>
  );
}
