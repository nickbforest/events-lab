import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cover art is local SVG for the prototype. next/image does not optimize
    // SVG by default, so allow it here; the Supabase Storage remote pattern
    // replaces this when real uploads land.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
