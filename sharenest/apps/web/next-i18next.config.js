/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['en', 'ja', 'zh'],
    localeDetection: false,
  },
  // モノレポでも確実に解決できるように、ファイルのあるディレクトリ基準で解決
  localePath: typeof window === 'undefined' ? require('path').resolve(__dirname, './public/locales') : '/locales',
  // localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  // reloadOnPrerender: process.env.NODE_ENV === 'development',
  // react: { useSuspense: false }, // Suspense を使わない場合
}; 