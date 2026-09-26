import type { NextConfig } from "next";

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

const nextConfig: NextConfig = {
  images: {
    // Event cover art is still local SVG in the prototype, and next/image does
    // not optimize SVG by default.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      // Profile images are capped at 5MB; multipart framing needs headroom
      // above that or a file right at the limit would be rejected.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
