import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { FaqPreview } from '../components/home/FaqPreview';
import { StickyCTA } from '../components/home/StickyCTA';
import { StructuredData } from '../components/seo/StructuredData';
import { NavigationHeader } from '../components/NavigationHeader';

type VehicleLite = { id: string; brand: string; model: string; price_day: number; seats: number };

const Home: NextPage = () => {
  const { t } = useTranslation('common');
  const [vehicles, setVehicles] = useState<VehicleLite[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getSupabase()
          .from('vehicles')
          .select('id,brand,model,price_day,seats')
          .limit(4);
        if (data) setVehicles(data as VehicleLite[]);
      } catch (error) {
        console.warn('Supabase接続エラー:', error);
        // フォールバックデータ
        setVehicles([
          { id: '1', brand: '日産', model: 'SAKURA', price_day: 6000, seats: 4 },
          { id: '2', brand: 'Tesla', model: 'Model 3', price_day: 15000, seats: 5 },
          { id: '3', brand: 'Mercedes', model: 'EQB', price_day: 12000, seats: 7 },
          { id: '4', brand: 'トヨタ', model: 'アルファード', price_day: 18000, seats: 8 },
        ]);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      <Head>
        <title>ShareNest Japan - カーシェアリング予約プラットフォーム</title>
        <meta name="description" content="ShareNest Japanで簡単にカーシェアリングを予約。最新のEV車両からファミリーカーまで、あなたにぴったりの車を見つけましょう。" />
        <link rel="canonical" href="https://sharenest.jp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StructuredData type="LocalBusiness" data={{}} />
      {/* 動的背景 */}
      <div className="fixed inset-0 animated-bg opacity-90 -z-10"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20 -z-10"></div>

      <NavigationHeader />

      <main className="relative z-10">
        {/* ヒーローセクション */}
        <section className="min-h-screen flex items-center justify-center px-4 relative pt-20">
          {/* フローティング要素 */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-[float_7s_ease-in-out_infinite]"></div>

          <div className="text-center max-w-6xl mx-auto">
            {/* グロー効果付きタイトル */}
            <div className="mb-8 space-y-4">
              <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
                <span className="gradient-text-cyber text-glow-cool block animate-[fadeInUp_1s_ease-out]">
                  Share
                </span>
                <span className="gradient-text block animate-[fadeInUp_1s_ease-out_0.2s_both]">
                  Nest
                </span>
          </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
            </div>

            <p className="text-xl md:text-3xl text-white/90 mb-12 font-light leading-relaxed animate-[fadeInUp_1s_ease-out_0.6s_both]">
              京都・大阪の<span className="text-cyan-300 font-semibold">次世代</span>カーシェア<br />
              <span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                今すぐ、未来を運転しよう
              </span>
            </p>

            {/* CTA ボタン */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-[fadeInUp_1s_ease-out_0.8s_both]">
              <Link
                href="/app/vehicles"
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-110 animate-[pulse-glow_2s_ease-in-out_infinite]"
              >
                <span className="relative z-10">🚗 車両を探す</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              <Link
                href="/features"
                className="group px-10 py-4 glass text-white text-xl font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 backdrop-blur-xl"
              >
                ✨ 機能を見る
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-3 gap-8 mt-16 animate-[fadeInUp_1s_ease-out_1s_both]">
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-5xl font-black gradient-text-blue mb-2">4台</div>
                <div className="text-white/80 text-sm md:text-base">稼働車両</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-5xl font-black gradient-text mb-2">24/7</div>
                <div className="text-white/80 text-sm md:text-base">利用可能</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-5xl font-black gradient-text-blue mb-2">5分</div>
                <div className="text-white/80 text-sm md:text-base">予約完了</div>
              </div>
            </div>
          </div>

          {/* スクロール指示 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
              <div className="w-1 h-3 bg-white/70 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* 車両セクション */}
        <section className="px-4 py-24 bg-gradient-to-br from-slate-900/50 to-indigo-900/50 backdrop-blur-3xl">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold gradient-text-blue mb-6">
                プレミアム車両ラインナップ
              </h2>
              <p className="text-xl text-white/80 mb-8">用途に合わせて選べる4つのカテゴリー</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {vehicles.map((v, index) => (
                <div 
                  key={v.id} 
                  className="card-3d glass rounded-3xl p-6 group hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl mb-4">
                      🚗
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">{v.make} {v.model}</h3>
                  <p className="text-white/70 text-center mb-4">{v.seat_count}名乗り</p>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-black gradient-text">¥{v.daily_rate.toLocaleString()}</span>
                    <span className="text-white/60 text-sm">/日〜</span>
                  </div>
                  <Link 
                    href={`/app/vehicles/${v.id}`}
                    className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    詳細を見る
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* カテゴリーセクション */}
        <section className="px-4 py-24">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center gradient-text mb-16">
              シーン別おすすめ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link href="/app/vehicles?tag=city" className="group">
                <div className="neomorphism p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <div className="text-6xl mb-4">🏙️</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">街乗り</h3>
                  <p className="text-gray-600 mb-4">SAKURA・コンパクト</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full"></div>
                </div>
              </Link>
              
              <Link href="/app/vehicles?tag=family" className="group">
                <div className="neomorphism p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">ファミリー</h3>
                  <p className="text-gray-600 mb-4">EQB・安全性重視</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
                </div>
              </Link>
              
              <Link href="/app/vehicles?tag=long" className="group">
                <div className="neomorphism p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <div className="text-6xl mb-4">🛣️</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">長距離</h3>
                  <p className="text-gray-600 mb-4">Model 3・快適性</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full"></div>
                </div>
            </Link>
              
              <Link href="/app/vehicles?tag=luxury" className="group">
                <div className="neomorphism p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">ラグジュアリー</h3>
                  <p className="text-gray-600 mb-4">アルファード・VIP</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
                </div>
            </Link>
            </div>
          </div>
        </section>

        <div className="px-4">
          <FaqPreview />
        </div>
      </main>

      <Footer />
      <StickyCTA />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ja', ['common'])),
    },
  };
};

export default Home;