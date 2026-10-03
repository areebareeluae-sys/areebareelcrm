import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Build ke waqt TypeScript errors ko bypass karne ke liye
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;