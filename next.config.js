/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimized for Docker deployment
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
    // domains is deprecated, using remotePatterns instead
  },
  // Configure global settings for API routes and server actions
  experimental: {
    serverActions: {
      // Increase body size limit for file uploads (default is 1MB)
      bodySizeLimit: '10mb',
    },
  },
  // PWA features will be implemented with next-pwa package later
};

module.exports = nextConfig;