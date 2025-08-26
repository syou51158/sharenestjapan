import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

type UserRole = 'admin' | 'owner' | 'user';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireVerification?: boolean;
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
};

export function ProtectedRoute({
  children,
  requiredRole,
  requireVerification = false,
  fallbackPath = '/app/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, userProfile, loading, hasPermission, isVerified } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute状態:', { loading, user: !!user, userProfile: !!userProfile, pathname: router.pathname, isRedirecting });
    
    if (!mounted || isRedirecting) {
      console.log('⏳ コンポーネントマウント待機中またはリダイレクト中...');
      return;
    }
    
    if (loading) {
      console.log('⏳ 認証ローディング中...');
      return;
    }

    // 未認証の場合はログインページにリダイレクト
    if (!user) {
      console.log('🚫 未認証ユーザー - リダイレクト');
      const currentPath = router.asPath;
      // 既にログインページにいる場合はリダイレクトしない
      if (!router.pathname.startsWith('/app/login')) {
        setIsRedirecting(true);
        router.replace(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    // 役割/本人確認が必要な場合のみ、プロフィールの読み込みを待つ
    const needsProfile = requireVerification || !!requiredRole;
    if (needsProfile && !userProfile) {
      console.log('⏳ プロフィール読み込み待機中...');
      return;
    }

    // 本人確認が必要な場合のチェック
    if (requireVerification && !isVerified) {
      console.log('🔒 本人確認が必要 - リダイレクト');
      setIsRedirecting(true);
      router.replace('/app/verification-required');
      return;
    }

    // 権限チェック
    if (requiredRole && !hasPermission(requiredRole)) {
      console.log('🚫 権限不足 - リダイレクト');
      setIsRedirecting(true);
      router.replace('/app/unauthorized');
      return;
    }

    console.log('✅ 認証・権限チェック完了');
    setIsRedirecting(false); // 認証完了時にリダイレクト状態をリセット
  }, [mounted, loading, user, userProfile, router, fallbackPath, requireVerification, requiredRole, hasPermission, isVerified, isRedirecting]);

  // SSR時は何も描画しない（ハイドレーション差分回避）
  if (!mounted) return null;

  // ローディング中
  if (loading) {
    return loadingComponent || (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!user) return null;

  // 役割/本人確認が必要な場合のみ、プロフィール未読込みで待機
  const needsProfile = requireVerification || !!requiredRole;
  if (needsProfile && !userProfile) {
    return loadingComponent || (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">プロフィールを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // 本人確認が必要だが未確認
  if (requireVerification && !isVerified) {
    return null;
  }

  // 権限不足
  if (requiredRole && !hasPermission(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

// 便利なラッパーコンポーネント
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function OwnerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="owner" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function VerifiedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireVerification'>) {
  return (
    <ProtectedRoute requireVerification={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}