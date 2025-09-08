/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config.js');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@sharenest/ui", "@sharenest/api"],
  i18n,
  // App Router を使用する場合は experimental: { appDir: true }
  webpack: (config) => {
    // 必要に応じてWebpack設定をカスタマイズ
    return config;
  },
};

module.exports = nextConfig; 