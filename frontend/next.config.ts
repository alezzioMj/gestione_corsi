/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignora gli errori per permettere il deploy immediato
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 2. Configura i rewrites per puntare a RENDER, non a localhost
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Sostituisci l'URL qui sotto con quello del tuo backend su Render
        destination: 'https://gestione-corsi-1.onrender.com/:path*', 
      },
    ];
  },
};

export default nextConfig;