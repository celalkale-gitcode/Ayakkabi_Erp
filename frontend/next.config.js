/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  swcMinify: true,

  output: "standalone", // 🔥 bunu ekle
};

module.exports = nextConfig;
