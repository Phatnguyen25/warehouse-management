import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // For Docker production build
  output: 'standalone',

  // Ignore TypeScript errors in build
  // (workaround for Next.js 16 route type generator bug with Prisma)
  typescript: { ignoreBuildErrors: true },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Warehouse Manager',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

export default nextConfig
