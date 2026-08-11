import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // Disabled to save memory
  // output: 'standalone',
  distDir: process.env.DIST_DIR || '.next',
  experimental: {
    // Reduce memory usage during build on limited GoDaddy servers
    workerThreads: false,
    cpus: 1,
  },


  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  }
};
export default nextConfig;