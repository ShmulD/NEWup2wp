/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true
    },
    basePath: '/NEWup2wp',
    assetPrefix: '/NEWup2wp/',
    trailingSlash: true,
};

module.exports = nextConfig;
