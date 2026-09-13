import path from "path";

/** @type {import('next').NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;