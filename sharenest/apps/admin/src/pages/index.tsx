import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const AdminHome: NextPage = () => {
  const { t } = useTranslation('common-admin');
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, vehicles: 4 });

  useEffect(() => {
    // 簡易統計（実際はAPIから取得）
    setStats({ bookings: 12, revenue: 450000, vehicles: 4 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head>
        <title>{t('adminPage.title')}</title>
        <meta name="description" content={String(t('adminPage.metaDescription'))} />
      </Head>

      {/* ヘッダー */}
      <div className="glass border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <h1 className="text-2xl font-black gradient-text-blue">ShareNest 管理</h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="glass px-4 py-2 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300">
                📊 ダッシュボード
              </Link>
              <Link href="/bookings" className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
                📅 予約管理
              </Link>
              <Link href="/vehicles" className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
                🚗 車両管理
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* ウェルカムセクション */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            管理ダッシュボード
          </h2>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            ShareNest の運営状況を一目で確認
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card-3d glass rounded-3xl p-8 text-center group hover:scale-105 transition-all duration-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl">
              📈
            </div>
            <h3 className="text-xl font-bold text-white mb-2">総予約数</h3>
            <p className="text-4xl font-black gradient-text-blue mb-2">{stats.bookings}</p>
            <p className="text-white/60">今月の実績</p>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="card-3d glass rounded-3xl p-8 text-center group hover:scale-105 transition-all duration-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl">
              💰
            </div>
            <h3 className="text-xl font-bold text-white mb-2">売上</h3>
            <p className="text-4xl font-black gradient-text mb-2">¥{stats.revenue.toLocaleString()}</p>
            <p className="text-white/60">今月の売上</p>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div className="card-3d glass rounded-3xl p-8 text-center group hover:scale-105 transition-all duration-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl">
              🚗
            </div>
            <h3 className="text-xl font-bold text-white mb-2">稼働車両</h3>
            <p className="text-4xl font-black gradient-text mb-2">{stats.vehicles}</p>
            <p className="text-white/60">台数</p>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* アクションセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 最近のアクティビティ */}
          <div className="card-3d glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                📊
              </div>
              <h3 className="text-2xl font-bold text-white">最近の予約</h3>
            </div>
            <div className="space-y-4">
              <div className="neomorphism-inset rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">Tesla Model 3</p>
                  <p className="text-gray-600 text-sm">山田太郎 • 2時間前</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">確定</span>
              </div>
              <div className="neomorphism-inset rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">日産 SAKURA</p>
                  <p className="text-gray-600 text-sm">田中花子 • 4時間前</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">利用中</span>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                href="/bookings" 
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                全ての予約を見る →
              </Link>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="card-3d glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-white">クイックアクション</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="neomorphism rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-gray-800 font-medium">新規予約</p>
              </button>
              <button className="neomorphism rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="text-3xl mb-2">🔧</div>
                <p className="text-gray-800 font-medium">車両メンテ</p>
              </button>
              <button className="neomorphism rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-gray-800 font-medium">レポート</p>
              </button>
              <button className="neomorphism rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="text-3xl mb-2">⚙️</div>
                <p className="text-gray-800 font-medium">設定</p>
              </button>
            </div>
          </div>
        </div>

        {/* リアルタイム通知 */}
        <div className="mt-8 glass rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-white">システム正常稼働中 • 最終更新: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ja', ['common-admin'])),
    },
  };
};

export default AdminHome;

 