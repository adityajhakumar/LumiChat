/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ⛔ Fix hydration issues & stale asset caching
  generateEtags: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },

          // ⭐ The important part — disable Chrome caching of old builds
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },

  // Ensure old service workers stop interfering
  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js'
      }
    ];
  },

  // TurboPack default
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        os: false,
      }

      config.externals = [...(config.externals || []), 'mammoth']
    }
    return config
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@vercel/analytics'],
    // Make sure new builds replace old ones
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
