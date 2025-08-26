import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css'; // Tailwind CSS を含むグローバルスタイル
import { DefaultSeo } from 'next-seo';
import { defaultSEO } from '../seo/defaultSeo';
import { AuthProvider } from '../components/auth/AuthProvider';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PageTransition } from '../components/PageTransition';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const path = router.pathname || '';
  const isAppRoute = path.startsWith('/app');
  const isAuthPage = path === '/app/login' || path === '/app/register';

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </Head>
      <DefaultSeo {...defaultSEO} />
      <PageTransition>
        {isAppRoute && !isAuthPage ? (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        ) : (
          <Component {...pageProps} />
        )}
      </PageTransition>
    </AuthProvider>
  );
}

export default appWithTranslation(MyApp);