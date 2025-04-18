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
    webpack: (config, { dev, isServer }) => {
        // Résolution de l'erreur Redux en définissant correctement l'environnement
        if (dev) {
            // Définit explicitement NODE_ENV=production dans webpack
            config.mode = 'production';
            
            // S'assure que les plugins DefinePlugin utilisent production
            config.plugins.forEach(plugin => {
                if (plugin.constructor.name === 'DefinePlugin') {
                    plugin.definitions['process.env.NODE_ENV'] = JSON.stringify('production');
                }
            });
        }

        // Ajout uniquement de l'alias pour react-redux sans modifier nodeEnv
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-redux': dev ? 'react-redux/dist/react-redux.js' : 'react-redux',
        };

        return config;
    },
};

export default nextConfig;
