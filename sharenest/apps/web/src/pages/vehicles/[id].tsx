import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSbSchema } from '../../lib/supabase';
import { NavigationHeader } from '../../components/NavigationHeader';
import { Footer } from '../../components/layout/Footer';

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  powertrain: string;
  range_km: number | null;
  price_day: number;
  price_hour: number;
  price_per_km: number;
  deposit: number;
  pickup_points: string[];
  rules: string[];
  photos?: string[];
  created_at: string;
  updated_at: string;
}

const VehicleDetail: NextPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const supabase = getSbSchema();
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vehicle:', error);
        setError('車両情報の取得に失敗しました');
      } else if (!data) {
        setError('車両が見つかりません');
      } else {
        setVehicle(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (vehicle) {
      router.push({
        pathname: '/app/checkout',
        query: { vehicleId: vehicle.id }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <Head>
          <title>車両詳細 | ShareNest</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-white/80">車両情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <Head>
          <title>エラー | ShareNest</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">エラー</h1>
            <p className="text-white/80 mb-4">{error}</p>
            <Link href="/app/vehicles" className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all">
              車両一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <title>{`${vehicle.title} | ShareNest`}</title>
        <meta name="description" content={`${vehicle.brand} ${vehicle.model} - ${vehicle.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavigationHeader />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 車両画像 */}
          <div className="card-3d glass rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{vehicle.title}</h2>
            <div className="grid grid-cols-1 gap-4">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                vehicle.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${vehicle.title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/800/600';
                    }}
                  />
                ))
              ) : (
                <div className="w-full h-64 bg-white/10 border border-white/10 flex items-center justify-center rounded-lg">
                  <span className="text-white/70">画像なし</span>
                </div>
              )}
            </div>
          </div>

          {/* 車両情報 */}
          <div className="card-3d glass rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">車両情報</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white/80">メーカー</h3>
                <p className="text-white">{vehicle.brand}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white/80">モデル</h3>
                <p className="text-white">{vehicle.model}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white/80">年式</h3>
                <p className="text-white">{vehicle.year}年</p>
              </div>
              <div>
                <h3 className="font-semibold text-white/80">定員</h3>
                <p className="text-white">{vehicle.seats}人</p>
              </div>
              <div>
                <h3 className="font-semibold text-white/80">パワートレイン</h3>
                <p className="text-white">{vehicle.powertrain}</p>
              </div>
              {vehicle.range_km && (
                <div>
                  <h3 className="font-semibold text-white/80">航続距離</h3>
                  <p className="text-white">{vehicle.range_km}km</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white/80">受取場所</h3>
                <p className="text-white">{vehicle.pickup_points.join(', ')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white/80">利用規約</h3>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  {vehicle.rules.map((rule, index) => (
                    <li key={index} className="text-sm">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">料金</h3>
              <div className="space-y-2 text-white">
                {vehicle.price_hour > 0 && (
                  <div className="flex justify-between">
                    <span>1時間料金:</span>
                    <span className="font-bold">¥{vehicle.price_hour}</span>
                  </div>
                )}
                {vehicle.price_day > 0 && (
                  <div className="flex justify-between">
                    <span>1日料金:</span>
                    <span className="font-bold">¥{vehicle.price_day}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>1km料金:</span>
                  <span className="font-bold">¥{vehicle.price_per_km}</span>
                </div>
                <div className="flex justify-between">
                  <span>デポジット:</span>
                  <span className="font-bold">¥{vehicle.deposit}</span>
                </div>
              </div>

              <div className="mt-6 text-right">
                <button onClick={handleBooking} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                  予約に進む
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default VehicleDetail;