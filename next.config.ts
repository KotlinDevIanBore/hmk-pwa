import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // PWA configuration
  ...(process.env.NODE_ENV === 'production' && {
    // Production-specific PWA settings
  }),
};

// For PWA, we'll use next-pwa in a separate config
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

export default withNextIntl(withPWA(nextConfig));


