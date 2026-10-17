import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dealer/dashboard/",
          "/api/",
          "/login",
          "/signup",
          "/register",
          "/forgot-password",
          "/update-password",
          "/settings",
          "/profile",
          "/my-inquiries",
          "/my-visits",
          "/my-listings",
          "/my-service-bookings",
          "/post-property",
          "/favorites",
          "/compare",
          "/auth/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
