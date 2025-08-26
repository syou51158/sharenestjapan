import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSbSchema } from '../../lib/supabase';

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Head>
          <title>車両詳細 | ShareNest</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">車両情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Head>
          <title>エラー | ShareNest</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/app/vehicles" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{`${vehicle.title} | ShareNest`}</title>
        <meta name="description" content={`${vehicle.brand} ${vehicle.model} - ${vehicle.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">ShareNest</Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/app/vehicles" className="font-medium text-blue-600">
                  車両を探す
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="font-medium text-gray-600 hover:text-blue-600">
                  マイブッキング
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 車両画像 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{vehicle.title}</h2>
            <div className="grid grid-cols-1 gap-4">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                vehicle.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${vehicle.title} - ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-car.jpg';
                    }}
                  />
                ))
              ) : (
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500">画像なし</span>
                </div>
              )}
            </div>
          </div>

          {/* 車両情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">車両情報</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">メーカー</h3>
                <p>{vehicle.brand}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">モデル</h3>
                <p>{vehicle.model}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">年式</h3>
                <p>{vehicle.year}年</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">定員</h3>
                <p>{vehicle.seats}人</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">パワートレイン</h3>
                <p>{vehicle.powertrain}</p>
              </div>
              
              {vehicle.range_km && (
                <div>
                  <h3 className="font-semibold text-gray-700">航続距離</h3>
                  <p>{vehicle.range_km}km</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-700">受取場所</h3>
                <p>{vehicle.pickup_points.join(', ')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">利用規約</h3>
                <ul className="list-disc list-inside space-y-1">
                  {vehicle.rules.map((rule, index) => (
                    <li key={index} className="text-sm">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-bold mb-4">料金</h3>
              <div className="space-y-2">
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
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                この車両を予約する
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto p-4 text-center text-gray-500 mt-8">
        © {new Date().getFullYear()} ShareNest
      </footer>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default VehicleDetail;