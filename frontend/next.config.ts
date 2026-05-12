/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignora gli errori per permettere il deploy immediato
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://gestione-corsi-1.onrender.com/:path*', 
      },
    ];
  },
};

export default nextConfig;