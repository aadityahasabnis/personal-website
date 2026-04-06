import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      },
      // {
      //   protocol: 'https',
      //   hostname: 'picsum.photos', // is this correct? -> yes or no? - 
      //   port: '',
      //   pathname: '/**',
      // }
      {
        // Cloudinary — used for article cover images and OG images
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        // Cloudflare CDN worker host used by media uploads
        protocol: 'https',
        hostname: 'cdn.aadityahasabnis.workers.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
