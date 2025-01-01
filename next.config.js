/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true
    },
    basePath: '/NEWup2wp',
    assetPrefix: '/NEWup2wp',
    trailingSlash: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false };
        return config;
    },
};

module.exports = nextConfig;
