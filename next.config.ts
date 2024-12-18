import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ratings.fide.com',
                port: '',
                pathname: '/img/**',
            },
            {
                protocol: 'https',
                hostname: 'images.chesscomfiles.com',
                port: '',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
