import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { VEHICLES } from '../../../data/vehicles';

type VehicleRow = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  pickup_points: string[];
};

const VehiclesPage: NextPage = () => {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await getSupabase()
          .from('vehicles')
          .select('id,title,brand,model,year,seats,pickup_points')
          .limit(50);
        if (!error && data && (data as any[]).length > 0) {
          setVehicles(data as VehicleRow[]);
        } else {
          // フォールバック: ローカルデータ
          setVehicles(
            VEHICLES.map((v) => ({
              id: v.id,
              title: v.title,
              brand: v.brand,
              model: v.model,
              year: v.year,
              seats: v.seats,
              pickup_points: v.pickup_points,
            })) as unknown as VehicleRow[]
          );
        }
      } catch {
        setVehicles(
          VEHICLES.map((v) => ({
            id: v.id,
            title: v.title,
            brand: v.brand,
            model: v.model,
            year: v.year,
            seats: v.seats,
            pickup_points: v.pickup_points,
          })) as unknown as VehicleRow[]
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-spin opacity-80"></div>
          <p className="text-2xl text-white font-light">車両を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* ヘッダーセクション */}
      <div className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black gradient-text-blue mb-6 animate-[fadeInUp_1s_ease-out]">
            車両ラインナップ
          </h1>
          <p className="text-xl md:text-2xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            あなたにぴったりの一台を見つけよう
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>
      </div>

      {/* 車両グリッド */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <div 
              key={vehicle.id} 
              className="card-3d glass rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-700"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 車両画像エリア */}
              <div className="relative h-64 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-8xl opacity-50">🚗</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="glass px-3 py-1 rounded-full text-sm text-white font-medium">
                    {vehicle.year}年
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 px-3 py-1 rounded-full text-sm text-white font-bold">
                    利用可能
                  </span>
                </div>
              </div>

              {/* 車両情報 */}
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white mb-2 group-hover:gradient-text-blue transition-all duration-500">
                    {vehicle.title}
                  </h2>
                  <p className="text-white/70 text-lg mb-1">{vehicle.brand} {vehicle.model}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      👥 {vehicle.seats}名乗り
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {vehicle.pickup_points?.join(', ') || '京都駅'}
                    </span>
                  </div>
                </div>

                {/* 価格とCTA */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-black gradient-text">
                      ¥6,000
                    </span>
                    <span className="text-white/60 text-sm ml-1">/日〜</span>
                  </div>
                  <Link
                    href={`/app/vehicles/${vehicle.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-cyan-500/50"
                  >
                    詳細を見る
                  </Link>
                </div>

                {/* 特徴タグ */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs">エコ</span>
                  <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs">安全装備</span>
                  <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs">快適</span>
                </div>
              </div>

              {/* ホバーエフェクト */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
            </div>
          ))}
        </div>

        {/* フィルターとソート */}
        <div className="glass rounded-3xl p-8 mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">もっと詳細に探す</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105">
              価格順
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105">
              燃費順
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105">
              人気順
            </button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105">
              新着順
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;


