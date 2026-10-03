import type { NextConfig } from "next";
import { LEGACY_PUBLISHER_SEGMENT, PUBLISHER_SEGMENT } from "./lib/routes";

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

const nextConfig: NextConfig = {
  images: {
    // Only uploaded media (PNG, JPEG, WebP) from the project's public buckets.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseUrl.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Public pages moved from `/publishers` to `/publisher` on 2026-10-03.
  // Permanent (308), so links already shared and indexed keep working and
  // search engines move to the new address.
  redirects() {
    return [
      {
        source: `/${LEGACY_PUBLISHER_SEGMENT}/:path*`,
        destination: `/${PUBLISHER_SEGMENT}/:path*`,
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      // Profile and event images are capped at 5MB; multipart framing needs headroom
      // above that or a file right at the limit would be rejected.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
