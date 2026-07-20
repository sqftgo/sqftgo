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
};

export default nextConfig;
