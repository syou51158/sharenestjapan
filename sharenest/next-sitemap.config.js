/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://sharenest.jp',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/app/*', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/admin/'],
      },
    ],
  },
  transform: async (config, path) => {
    const defaultTransform = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };

    // トップページは最高優先度
    if (path === '/') {
      return {
        ...defaultTransform,
        priority: 1.0,
        changefreq: 'daily',
      };
    }

    // 静的ページは中優先度
    if (['/features', '/pricing', '/faq', '/legal'].includes(path)) {
      return {
        ...defaultTransform,
        priority: 0.8,
        changefreq: 'weekly',
      };
    }

    return defaultTransform;
  },
};










