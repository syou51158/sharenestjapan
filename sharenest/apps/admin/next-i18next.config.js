/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en', 'zh'],
    localeDetection: false,
  },
  defaultNS: 'common-admin',
  // localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
}; 