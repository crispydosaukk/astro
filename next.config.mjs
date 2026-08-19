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
      { source: '/services/free-horoscope', destination: '/services/free-janam-kundli', permanent: false },
      { source: '/remedies/free-horoscope', destination: '/services/free-janam-kundli', permanent: false },
      { source: '/remedies/free-janam-kundli', destination: '/services/free-janam-kundli', permanent: false },
      { source: '/remedies/free-kundli-matching', destination: '/services/free-kundli-matching', permanent: false },
      { source: '/remedies/free-daily-horoscope', destination: '/services/free-daily-horoscope', permanent: false },
      { source: '/remedies/free-panchang', destination: '/services/free-panchang', permanent: false },
      { source: '/remedies/free-fasting-planner', destination: '/services/free-fasting-planner', permanent: false },
      { source: '/remedies/free-meditation-guide', destination: '/services/free-meditation-guide', permanent: false },
      { source: '/services/gemstone', destination: '/remedies/gemstone', permanent: false },
      { source: '/services/mantra', destination: '/remedies/mantra', permanent: false },
      { source: '/services/yantra', destination: '/remedies/yantra', permanent: false },
      { source: '/services/homa', destination: '/remedies/homa', permanent: false },
      { source: '/services/ishta-devata', destination: '/remedies/ishta-devata', permanent: false },
      { source: '/services/muhurtham', destination: '/remedies/muhurtham', permanent: false },
      { source: '/services/vastu', destination: '/remedies/vastu', permanent: false },
      { source: '/services/charity', destination: '/remedies/charity', permanent: false },
      { source: '/services/rudraksha', destination: '/remedies/rudraksha', permanent: false },
      { source: '/services/fasting', destination: '/remedies/fasting', permanent: false },
    ];
  },
};
export default nextConfig;