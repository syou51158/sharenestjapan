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
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // 開発環境でのみService Workerとキャッシュを自動的に解除
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Service Workerの登録解除
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }

      // キャッシュのクリア
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  // 認証が不要なパスを定義
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isAppRoute = router.pathname.startsWith('/app');
  const isAuthPage = publicPaths.includes(router.pathname);

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
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