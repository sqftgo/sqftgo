/**
 * Destination cover photos — hosted under /public/cities (Wikimedia Commons landmarks).
 * Prefer these over hotlinked Unsplash URLs so images stay correct and online.
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

export function cityCoverImage(name: string, fallback?: string): string {
  const key = name?.trim();
  if (!key) return fallback ?? "/DestinationHero.png";
  if (CITY_IMAGE_FILES[key]) return CITY_IMAGE_FILES[key];
  const match = Object.entries(CITY_IMAGE_FILES).find(
    ([city]) => city.toLowerCase() === key.toLowerCase()
  );
  return match?.[1] ?? fallback ?? "/DestinationHero.png";
}
