/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // חשוב! זה מגדיר את הפרויקט כסטטי
    images: {
      unoptimized: true
    }
  };
  
  module.exports = nextConfig;