import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { NavigationHeader } from '../../../components/NavigationHeader';

type VehicleRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  seat_count: number;
  fuel_type: string;
  address: string[];
  description: string;
  daily_rate: number;
};

const VehicleDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [v, setV] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // フェッチにタイムアウトを設けるヘルパー
  const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) => {
    const { timeout = 15000, ...rest } = options;
    const controller = new AbortController();
    const idTimer = setTimeout(() => controller.abort(), timeout);
    try {
      const resp = await fetch(resource, { ...rest, signal: controller.signal });
      return resp;
    } finally {
      clearTimeout(idTimer);
    }
  };
  
  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // APIエンドポイントを使用してデータを取得
        const response = await fetchWithTimeout(`/api/vehicles/${id}`, { timeout: 8000 });
        if (response.ok) {
          const data = await response.json();
          // コンポーネントがアンマウントされていない場合のみ状態を更新
          if (isMounted) {
            // Supabaseのデータ構造をVehicleRowに変換
            setV({
              id: data.id,
              make: data.brand,
              model: data.model,
              year: data.year,
              seat_count: data.seats,
              fuel_type: data.powertrain,
              address: data.pickup_points || [],
              description: data.title,
              daily_rate: data.price_day || 6000,
            });
          }
        } else {
          if (isMounted) {
            setError('車両データの取得に失敗しました');
          }
        }
      } catch (err: any) {
        console.error('Error fetching vehicle:', err);
        if (isMounted) {
          if (err?.name === 'AbortError') {
            setError('サーバー応答がタイムアウトしました（8秒）');
          } else {
            setError('車両データの取得中にエラーが発生しました');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVehicle();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-spin opacity-80"></div>
          <p className="text-2xl text-white font-light">車両情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !v) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🚗</div>
          <h2 className="text-3xl font-bold text-white mb-4">車両が見つかりません</h2>
          <p className="text-white/70 mb-8">{error || '指定された車両は存在しないか、現在利用できません。'}</p>
          <button 
            onClick={() => router.push('/app/vehicles')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
          >
            車両一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <NavigationHeader showBack backUrl="/app/vehicles" title={`${v.make} ${v.model}`} />
      
      {/* ヒーローセクション */}
      <div className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black gradient-text-blue mb-6 animate-[fadeInUp_1s_ease-out]">
              {v.make} {v.model}
            </h1>
            <p className="text-2xl md:text-3xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
              {v.make} {v.model} / {v.year}年
            </p>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 車両詳細情報 */}
          <div className="space-y-8">
            {/* メイン車両カード */}
            <div className="card-3d glass rounded-3xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 flex items-center justify-center">
                <div className="text-9xl opacity-60">🚗</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-6 right-6">
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 rounded-full text-white font-bold shadow-lg">
                    利用可能
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                        👥
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">定員</p>
                        <p className="text-white text-xl font-bold">{v.seat_count}名</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
                        📅
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">年式</p>
                        <p className="text-white text-xl font-bold">{v.year}年</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-400 rounded-xl flex items-center justify-center">
                        ⚡
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">燃料タイプ</p>
                        <p className="text-white text-lg font-bold">{v.fuel_type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center">
                        📍
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">受渡し場所</p>
                        <p className="text-white text-lg font-bold">{v.address?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ルール・特徴 */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">車両説明</h3>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-white/80">{v.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 予約セクション */}
          <div className="space-y-8">
            {/* 料金カード */}
            <div className="card-3d glass rounded-3xl p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">料金プラン</h2>
              <div className="space-y-6">
                <div className="neomorphism-inset rounded-2xl p-6">
                  <div className="text-5xl font-black gradient-text mb-2">
                    ¥{v.daily_rate?.toLocaleString() || '6,000'}
                  </div>
                  <p className="text-gray-600 text-lg">/ 日（24時間）</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-white/60 mb-1">時間料金</p>
                    <p className="text-white font-bold">¥500/時間</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-white/60 mb-1">距離料金</p>
                    <p className="text-white font-bold">¥20/km</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 予約ボタン */}
            <div className="card-3d glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white text-center mb-6">今すぐ予約</h3>
              <Link
                href={{ pathname: '/app/checkout', query: { vehicleId: v.id } }}
                className="block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold text-center rounded-2xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/50 animate-[pulse-glow_2s_ease-in-out_infinite]"
              >
                🚗 予約へ進む
              </Link>
              <p className="text-white/60 text-center text-sm mt-4">
                キャンセル無料 • 即時予約確定
              </p>
            </div>

            {/* 安心・信頼 */}
            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 text-center">安心・安全</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div>
                    <p className="text-white font-medium">24時間サポート</p>
                    <p className="text-white/60 text-sm">困った時はいつでもご連絡ください</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                    🛡️
                  </div>
                  <div>
                    <p className="text-white font-medium">保険完備</p>
                    <p className="text-white/60 text-sm">安心の補償でドライブを楽しめます</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    🧽
                  </div>
                  <div>
                    <p className="text-white font-medium">清掃済み</p>
                    <p className="text-white/60 text-sm">毎回丁寧にクリーニングしています</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;


