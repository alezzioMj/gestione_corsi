"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = nextConfig;
