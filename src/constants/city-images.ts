/**
 * Destination cover photos.
 * Priority: admin `locations.cover_image_url` (runtime map) → static `/public/cities` → fallback.
 */

const CITY_IMAGE_FILES: Record<string, string> = {
  Udaipur: "/cities/udaipur.jpg",
  Jaipur: "/cities/jaipur.jpg",
  Jaisalmer: "/cities/jaisalmer.jpg",
  Jodhpur: "/cities/jodhpur.jpg",
  Kota: "/cities/kota.jpg",
  Bikaner: "/cities/bikaner.jpg",
  Pushkar: "/cities/pushkar.jpg",
  Ajmer: "/cities/ajmer.jpg",
  Pali: "/cities/pali.jpg",
  Alwar: "/cities/alwar.jpg",
  Rajsamand: "/cities/rajsamand.jpg",
  Ahmedabad: "/cities/ahmedabad.jpg",
  Surat: "/cities/surat.jpg",
  Rajkot: "/cities/rajkot.jpg",
  Gandhinagar: "/cities/gandhinagar.jpg",
  Kutch: "/cities/kutch.jpg",
  Anand: "/cities/anand.jpg",
  Shimla: "/cities/shimla.jpg",
  Dharamshala: "/cities/dharamshala.jpg",
  Chittorgarh: "/cities/chittorgarh.jpg",
  Bundi: "/cities/bundi.jpg",
  Vadodara: "/cities/vadodara.jpg",
  Bengaluru: "/cities/bengaluru.jpg",
  Bangalore: "/cities/bengaluru.jpg",
  Delhi: "/cities/delhi.jpg",
  "New Delhi": "/cities/delhi.jpg",
  Hyderabad: "/cities/hyderabad.jpg",
  Pune: "/cities/pune.jpg",
  Chennai: "/cities/chennai.jpg",
  Indore: "/cities/indore.jpg",
  Gurugram: "/cities/gurugram.jpg",
  Gurgaon: "/cities/gurugram.jpg",
  Noida: "/cities/noida.jpg",
};

/** @deprecated use cityCoverImage — kept for callers that import the map */
export const CITY_IMAGES: Record<string, string> = CITY_IMAGE_FILES;

/** Populated from active/admin locations catalog so every cityCoverImage() call prefers DB covers. */
let locationCoverByCity = new Map<string, string>();

export function setLocationCoverMap(
  entries: Array<{ city: string; coverImageUrl?: string | null }>
): void {
  const next = new Map<string, string>();
  for (const entry of entries) {
    const city = entry.city?.trim();
    const url = entry.coverImageUrl?.trim();
    if (!city || !url) continue;
    next.set(city.toLowerCase(), url);
  }
  locationCoverByCity = next;
}

function staticCoverFor(name: string): string | undefined {
  if (CITY_IMAGE_FILES[name]) return CITY_IMAGE_FILES[name];
  const match = Object.entries(CITY_IMAGE_FILES).find(
    ([city]) => city.toLowerCase() === name.toLowerCase()
  );
  return match?.[1];
}

export function cityCoverImage(name: string, fallback?: string | null): string {
  const key = name?.trim();
  if (!key) return fallback?.trim() || "/DestinationHero.png";

  const fromDb = locationCoverByCity.get(key.toLowerCase());
  if (fromDb) return fromDb;

  const preferred = fallback?.trim();
  if (preferred && (preferred.startsWith("http") || preferred.startsWith("/cities/"))) {
    return preferred;
  }

  const fromStatic = staticCoverFor(key);
  if (fromStatic) return fromStatic;

  return preferred || "/DestinationHero.png";
}
