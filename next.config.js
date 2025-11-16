/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Force unique build IDs to prevent cache issues
  generateBuildId: async () => {
    // Use timestamp to ensure fresh builds
    return `build-${Date.now()}`
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for security and cache control
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Add cache control for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        // Different cache strategy for HTML pages
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ],
      },
    ]
  },
  
  // Turbopack configuration (Next.js 16+ default)
  turbopack: {},
  
  // Webpack configuration (fallback for --webpack mode)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js modules from being bundled in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        os: false,
      }
      
      // Explicitly exclude mammoth from client bundle
      config.externals = [...(config.externals || []), 'mammoth']
    }
    return config
  },
  
  // Experimental features for package optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@vercel/analytics'],
    // Disable PPR to prevent hydration issues
    ppr: false,
  },
}

module.exports = nextConfig
