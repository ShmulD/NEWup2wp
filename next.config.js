/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/up2wp',  // שם הריפו שלך בגיטהאב
};

module.exports = nextConfig;