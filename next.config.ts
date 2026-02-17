import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/pwa/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Required for Docker deployment
  typescript: {
    // next-auth v4 types are incompatible with Next.js 16 strict route validation.
    // TODO: Remove this once migrated to next-auth v5 (Auth.js).
    ignoreBuildErrors: true,
  },
};

export default withSerwist(nextConfig);
