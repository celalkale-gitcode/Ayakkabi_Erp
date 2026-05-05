import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  swcMinify: true,

  images: {
    unoptimized: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
