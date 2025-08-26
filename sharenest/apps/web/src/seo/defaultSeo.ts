import type { DefaultSeoProps } from 'next-seo';

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | ShareNest Japan',
  defaultTitle: 'ShareNest Japan',
  description:
    '京都・大阪を中心に、用途に合わせて選べるカーシェア。オンライン予約・決済・契約まで完結。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    site_name: 'ShareNest Japan',
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'ShareNest Japan',
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
  },
};







