import { useRouter } from 'next/router';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (loading) return;

    // 未認証の場合はログインページにリダイレクト
    if (!user) {
      const currentPath = router.asPath;
      router.push(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // ユーザープロフィールが読み込まれていない場合は待機
    if (!userProfile) {
      return;
    }

    // 本人確認が必要な場合のチェック
    if (requireVerification && !isVerified) {
      router.push('/app/verification-required');
      return;
    }

    // 権限チェック
    if (requiredRole && !hasPermission(requiredRole)) {
      router.push('/app/unauthorized');
      return;
    }
  }, [user, userProfile, loading, requiredRole, requireVerification, hasPermission, isVerified, router, fallbackPath]);

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

  // 未認証またはユーザープロフィール未読み込み
  if (!user || !userProfile) {
    return null;
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