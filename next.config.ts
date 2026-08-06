import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.google.com" },
      { protocol: "https", hostname: "content.jdmagicbox.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      // Uploaded listing images from Supabase Storage
      {
        protocol: "https",
        hostname: "iwldglorfloyupayvmxd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // All routes including API — transport/browser hardening.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dealer/dashboard/messages",
        destination: "/dealer/dashboard/inquiries?tab=messages",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
