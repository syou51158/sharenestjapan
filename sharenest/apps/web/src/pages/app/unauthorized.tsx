import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../components/auth/AuthProvider';
import { NavigationHeader } from '../../components/NavigationHeader';

const UnauthorizedPage: NextPage = () => {
  const { userProfile, isAdmin, isOwner } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'owner': return 'オーナー';
      case 'user': return '利用者';
      default: return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <title>アクセス権限がありません | ShareNest</title>
        <meta name="description" content="このページにアクセスする権限がありません" />
      </Head>

      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>
      
      <NavigationHeader />
      
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* エラーアイコン */}
            <div className="text-8xl mb-8 animate-[fadeInUp_1s_ease-out]">
              🚫
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out_0.2s_both]">
              アクセス権限がありません
            </h1>
            
            <p className="text-xl text-white/80 mb-8 animate-[fadeInUp_1s_ease-out_0.4s_both]">
              申し訳ございませんが、このページにアクセスする権限がありません。
            </p>

            {/* 現在の権限情報 */}
            {userProfile && (
              <div className="glass rounded-3xl p-8 mb-8 animate-[fadeInUp_1s_ease-out_0.6s_both]">
                <h2 className="text-2xl font-bold text-white mb-4">現在のアカウント情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">ユーザー名</div>
                    <div className="text-white font-medium">{userProfile.name}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">権限レベル</div>
                    <div className="text-white font-medium">
                      {getRoleDisplayName(userProfile.role)}
                      {isAdmin && ' 👑'}
                      {isOwner && !isAdmin && ' 🏠'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">本人確認</div>
                    <div className="text-white font-medium">
                      {userProfile.is_verified ? (
                        <span className="text-green-400">✓ 確認済み</span>
                      ) : (
                        <span className="text-yellow-400">⏳ 未確認</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-white/70 text-sm mb-1">KYCステータス</div>
                    <div className="text-white font-medium">
                      {userProfile.kyc_status === 'approved' && (
                        <span className="text-green-400">✓ 承認済み</span>
                      )}
                      {userProfile.kyc_status === 'pending' && (
                        <span className="text-yellow-400">⏳ 審査中</span>
                      )}
                      {userProfile.kyc_status === 'rejected' && (
                        <span className="text-red-400">❌ 拒否</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 権限アップグレードの提案 */}
            {userProfile?.role === 'user' && (
              <div className="glass rounded-3xl p-8 mb-8 animate-[fadeInUp_1s_ease-out_0.8s_both]">
                <h3 className="text-2xl font-bold text-white mb-4">権限をアップグレードしませんか？</h3>
                <p className="text-white/70 mb-6">
                  車両オーナーになると、より多くの機能にアクセスできるようになります。
                </p>
                <Link
                  href="/app/profile"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
                >
                  オーナー申請を開始
                </Link>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fadeInUp_1s_ease-out_1s_both]">
              <Link
                href="/app/vehicles"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-medium"
              >
                車両一覧に戻る
              </Link>
              
              <Link
                href="/app/profile"
                className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
              >
                プロフィール設定
              </Link>
            </div>

            {/* ヘルプ情報 */}
            <div className="mt-12 text-center animate-[fadeInUp_1s_ease-out_1.2s_both]">
              <p className="text-white/60 mb-4">
                ご不明な点がございましたら、サポートまでお問い合わせください。
              </p>
              <Link
                href="/contact"
                className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
              >
                サポートに問い合わせる
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;