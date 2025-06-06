import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  reactStrictMode: false,
};

export default nextConfig;
