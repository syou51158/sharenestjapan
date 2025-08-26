import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;

    const handleStart = (url: string) => {
      console.log('🔄 ページ遷移開始:', url);
      // 短い遅延を設けて、瞬時の遷移でローディングが点滅しないようにする
      loadingTimeout = setTimeout(() => {
        setLoading(true);
      }, 50);
    };

    const handleComplete = (url: string) => {
      console.log('✅ ページ遷移完了:', url);
      clearTimeout(loadingTimeout);
      setLoading(false);
    };

    const handleError = (err: Error, url: string) => {
      console.error('❌ ページ遷移エラー:', err, url);
      clearTimeout(loadingTimeout);
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      clearTimeout(loadingTimeout);
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-spin opacity-80"></div>
            <p className="text-white font-medium">ページを読み込み中...</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}