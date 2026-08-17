import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@paydocs/shared'],
  serverExternalPackages: ['canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
