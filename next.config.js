/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
};

// בודק אם אנחנו מריצים ב-GitHub Pages
if (process.env.GITHUB_PAGES) {
  nextConfig.basePath = '/NEWup2wp';
  nextConfig.assetPrefix = '/NEWup2wp/';
}

module.exports = nextConfig;
