import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false, // Disabled to save memory
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
  },
  async redirects() {
    return [
      {
        source: '/services/:path*',
        destination: '/remedies/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;