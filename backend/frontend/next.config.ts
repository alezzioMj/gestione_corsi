import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Reindirizza al backend rimuovendo il prefisso /api
      },
    ];
  },
};

export default nextConfig;
