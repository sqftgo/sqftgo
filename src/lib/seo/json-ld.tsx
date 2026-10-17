import { getSiteOrigin, SITE_NAME, DEFAULT_DESCRIPTION } from "./site";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    logo: `${origin}/favicon.ico`,
    areaServed: "IN",
    sameAs: [
      "https://instagram.com/sqftgo",
      "https://facebook.com/sqftgo",
      "https://youtube.com/sqftgo",
    ],
  };
}

export function realEstateListingJsonLd(input: {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  locality: string;
  images: string[];
  purpose?: string;
}) {
  const origin = getSiteOrigin();
  const url = `${origin}/property/${input.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: input.title,
    description: input.description.slice(0, 500),
    url,
    datePosted: new Date().toISOString().slice(0, 10),
    image: input.images.slice(0, 5),
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: input.locality || input.city,
      addressRegion: input.city,
      addressCountry: "IN",
    },
  };
}

/** City page facts for search and AI answers. */
export function cityPlaceJsonLd(input: {
  slug: string;
  name: string;
  title: string;
  description: string;
  history: string;
  region: string;
  localities: string[];
  averagePrice: string;
}) {
  const origin = getSiteOrigin();
  const url = `${origin}/destinations/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: input.name,
    alternateName: input.title,
    description: `${input.description} ${input.history}`.slice(0, 700),
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.name,
      addressRegion: input.region,
      addressCountry: "IN",
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: input.region,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Typical listing range", value: input.averagePrice },
      { "@type": "PropertyValue", name: "Localities", value: input.localities.join(", ") },
    ],
  };
}
