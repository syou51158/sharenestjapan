import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';

interface NavigationHeaderProps {
  showBack?: boolean;
  backUrl?: string;
  title?: string;
}

export const NavigationHeader = ({ showBack = false, backUrl, title }: NavigationHeaderProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, userProfile, signOut, loading, isAdmin, isOwner } = useAuth();



  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ユーザーメニューを外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-user-menu]')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // ユーザーの役割に応じたナビゲーションアイテム
  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: 'ホーム' },
    ];

    if (!user) {
      return [
        ...baseItems,
        { href: '/app/vehicles', label: '車を探す' },
        { href: '/features', label: '機能' },
        { href: '/pricing', label: '料金' },
        { href: '/faq', label: 'FAQ' },
      ];
    }

    // 管理者メニュー
    if (isAdmin) {
      return [
        ...baseItems,
        { href: '/app/vehicles', label: '車を探す' },
        { href: '/app/bookings', label: '予約履歴' },
        { href: '/app/owner/dashboard', label: 'オーナー管理' },
        { href: '/admin', label: '管理者画面' },
      ];
    }

    // オーナーメニュー
    if (isOwner) {
      return [
        ...baseItems,
        { href: '/app/vehicles', label: '車を探す' },
        { href: '/app/bookings', label: '予約履歴' },
        { href: '/app/owner/dashboard', label: 'オーナー管理' },
        { href: '/app/owner/vehicles', label: '車両管理' },
        { href: '/app/owner/bookings', label: '予約管理' },
      ];
    }

    // 一般ユーザーメニュー
    return [
      ...baseItems,
      { href: '/app/vehicles', label: '車を探す' },
      { href: '/app/bookings', label: '予約履歴' },
      { href: '/features', label: '機能' },
      { href: '/pricing', label: '料金' },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左側: ロゴまたは戻るボタン */}
          <div className="flex items-center space-x-4">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">戻る</span>
              </button>
            ) : (
              <Link href="/" className="text-2xl font-bold gradient-text-blue">
                ShareNest Japan
              </Link>
            )}
          </div>

          {/* 中央: ページタイトル（モバイルでは省略） */}
          {title && (
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text白">{title}</h1>
            </div>
          )}

          {/* 右側: ナビゲーション */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white hover:text-cyan-400 transition-colors duration-200 ${
                    router.pathname === item.href ? 'text-cyan-400 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* 認証状態の表示 */}
            {loading ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="読み込み中"></div>
            ) : user ? (
              <div className="relative" data-user-menu>
                 <button
                   onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                   className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors duration-200"
                 >
                  {userProfile?.avatar || user?.user_metadata?.avatar_url ? (
                    <img
                      src={userProfile?.avatar || user?.user_metadata?.avatar_url}
                      alt="プロフィール画像"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {userProfile?.name?.charAt(0).toUpperCase() || user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{userProfile?.name || user?.user_metadata?.full_name || user.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 py-2">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white/70">ログイン中</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      {userProfile && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            userProfile.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                            userProfile.role === 'owner' ? 'bg-green-500/20 text-green-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {userProfile.role === 'admin' ? '管理者' :
                             userProfile.role === 'owner' ? 'オーナー' : '利用者'}
                          </span>
                          {userProfile.is_verified && (
                            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                              認証済み
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/app/profile"
                        className="block px-4 py-2 text-sm text白 hover:bg-slate-700/50 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        アカウント管理
                      </Link>
                      
                      {isOwner && (
                        <Link
                          href="/app/owner/dashboard"
                          className="block px-4 py-2 text-sm text白 hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          オーナーダッシュボード
                        </Link>
                      )}
                      
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text白 hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          管理者画面
                        </Link>
                      )}
                      
                      {!userProfile?.is_verified && (
                        <Link
                          href="/app/verification-required"
                          className="block px-4 py-2 text-sm text-yellow-300 hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          本人確認を完了
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text白 hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/app/login"
                  className="text-white hover:text-cyan-400 transition-colors duration-200"
                >
                  ログイン
                </Link>
                <Link
                  href="/app/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden text-white hover:text-cyan-400 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-white/10 pt-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-slate-800/50 transition-colors duration-200 ${
                    router.pathname === item.href ? 'bg-slate-800/50 text-white' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* モバイル認証状態 */}
            <div className="mt-4 pt-4 border-t border-white/10">
              {loading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="読み込み中"></div>
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {userProfile?.avatar || user?.user_metadata?.avatar_url ? (
                        <img
                          src={userProfile?.avatar || user?.user_metadata?.avatar_url}
                          alt="プロフィール画像"
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                          {userProfile?.name?.charAt(0).toUpperCase() || user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-white/70">ログイン中</p>
                        <p className="text-sm font-medium text-white truncate">{userProfile?.name || user?.user_metadata?.full_name || user.email}</p>
                        {userProfile && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              userProfile.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                              userProfile.role === 'owner' ? 'bg-green-500/20 text-green-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {userProfile.role === 'admin' ? '管理者' :
                               userProfile.role === 'owner' ? 'オーナー' : '利用者'}
                            </span>
                            {userProfile.is_verified && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                                認証済み
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2">
                    <Link
                      href="/app/profile"
                      className="block px-4 py-2 text-left text-white/80 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      アカウント管理
                    </Link>
                    
                    {isOwner && (
                      <Link
                        href="/app/owner/dashboard"
                        className="block px-4 py-2 text-left text-white/80 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        オーナーダッシュボード
                      </Link>
                    )}
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-left text-white/80 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        管理者画面
                      </Link>
                    )}
                    
                    {!userProfile?.is_verified && (
                      <Link
                        href="/app/verification-required"
                        className="block px-4 py-2 text-left text-yellow-300 hover:text-yellow-200 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        本人確認を完了
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/app/login"
                    className="block px-4 py-2 text-center text-white/80 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/app/register"
                    className="block px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text白 font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};