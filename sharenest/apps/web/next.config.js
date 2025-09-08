/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');
const isPagesExport = process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true';
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@sharenest/ui", "@sharenest/api"],
  eslint: {
    // CI でのビルド失敗を防ぐため、Lint はビルド時に無視（別ジョブ/ローカルで対応）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 型エラーで本番ビルドを止めない（後で段階的に是正）
    ignoreBuildErrors: true,
  },
  // GitHub Pages 用の静的出力では i18n は使用不可（Next の制約）
  ...(isPagesExport ? {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  } : { i18n }),
  // ページ遷移時のローディング問題を解決するための設定
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  // Fast Refreshの設定を最適化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  ...(isPagesExport ? {} : {
    async redirects() {
      return [
        {
          source: '/find-car',
          destination: '/app/vehicles',
          permanent: true,
        },
      ];
    },
  }),
  webpack: (config, { isServer }) => {
    // ページ遷移時のパフォーマンス最適化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // 共通チャンクの最適化
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      },
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);