/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  async redirects() {
    return [
      {
        source: '/find-car',
        destination: '/app/vehicles',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    return config;
  },
};

module.exports = withPWA(nextConfig);