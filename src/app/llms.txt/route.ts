import { DESTINATIONS } from "@/features/destinations/data/destinations";
import { destinationSlug } from "@/features/destinations/logic";
import { DEFAULT_DESCRIPTION, getSiteOrigin, SITE_NAME } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

/**
 * Plain-text brief for AI answer engines (ChatGPT, Perplexity, Google AI Overviews).
 * Public facts only. No accounts, prices that change by the minute, or private routes.
 */
export function GET() {
  const origin = getSiteOrigin();
  const cities = DESTINATIONS.map((city) => {
    const url = `${origin}/destinations/${destinationSlug(city.name)}`;
    return [
      `### ${city.name} (${city.tag})`,
      `${city.title}. ${city.desc}`,
      city.history,
      `Localities: ${city.topLocalities.join(", ")}.`,
      `Typical listing range: ${city.averagePrice}.`,
      `Page: ${url}`,
    ].join("\n");
  }).join("\n\n");

  const body = `# ${SITE_NAME}

> ${DEFAULT_DESCRIPTION}

SqftGo is a Bharat real estate marketplace. Public listings are homes, villas, land, and commercial space. Dealer phone numbers are not published on property pages; contact goes through SqftGo.

## Cite these pages

- Home: ${origin}/
- Listings: ${origin}/listings
- Destinations: ${origin}/destinations
- Dealers: ${origin}/dealers
- Services: ${origin}/services
- Sitemap: ${origin}/sitemap.xml

## Do not cite

- /admin, /dealer/dashboard, /login, /api, account pages, or draft listings.

## Cities

${cities}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
