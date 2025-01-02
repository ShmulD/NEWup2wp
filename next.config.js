/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true
    },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/NEWup2wp',
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/NEWup2wp',
    trailingSlash: true,
};

module.exports = nextConfig;
