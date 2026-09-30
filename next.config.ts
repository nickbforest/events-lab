import type { NextConfig } from "next";

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
  experimental: {
    serverActions: {
      // Profile and event images are capped at 5MB; multipart framing needs headroom
      // above that or a file right at the limit would be rejected.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
