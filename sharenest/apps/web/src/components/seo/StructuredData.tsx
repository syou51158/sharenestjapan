import Head from 'next/head';

type StructuredDataProps = {
  type: 'Organization' | 'Product' | 'LocalBusiness' | 'FAQPage';
  data: any;
};

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    if (type === 'Organization') {
      return {
        ...baseData,
        name: 'ShareNest Japan',
        url: 'https://sharenest.jp',
        logo: 'https://sharenest.jp/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+81-75-000-0000',
          contactType: 'customer service',
          areaServed: 'JP',
          availableLanguage: ['Japanese'],
        },
        sameAs: [
          'https://twitter.com/sharenest_jp',
          'https://facebook.com/sharenest.jp',
        ],
      };
    }

    if (type === 'LocalBusiness') {
      return {
        ...baseData,
        '@type': 'CarRental',
        name: 'ShareNest Japan',
        description: '京都・大阪のカーシェアリングサービス',
        url: 'https://sharenest.jp',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '京都市',
          addressRegion: '京都府',
          addressCountry: 'JP',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 35.0116,
          longitude: 135.7681,
        },
        areaServed: ['京都府', '大阪府', '滋賀県'],
        priceRange: '¥5,000-¥30,000',
      };
    }

    return baseData;
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData()),
        }}
      />
    </Head>
  );
}









