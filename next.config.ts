import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.google.com" },
      { protocol: "https", hostname: "content.jdmagicbox.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dealer/dashboard/messages",
        destination: "/dealer/dashboard/inquiries?tab=messages",
        permanent: true,
      },
      {
        source: "/dealer/dashboard/notifications",
        destination: "/dealer/dashboard/settings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
