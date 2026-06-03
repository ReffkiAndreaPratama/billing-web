import type { NextConfig } from "next";

// 'standalone' output dipakai saat build via Docker (self-hosted).
// Vercel mengabaikan setting ini dan menggunakan pipeline build-nya sendiri.
const nextConfig: NextConfig = {
  output: process.env.BUILD_MODE === 'docker' ? 'standalone' : undefined,
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
};

export default nextConfig;
