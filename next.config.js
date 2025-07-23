/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Add local domain for uploads
    domains: ['oyagema.com', 'localhost'],
    // Disable optimization for uploads in standalone mode
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Configure global settings for API routes and server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Add rewrites for static files in standalone mode
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/static/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;