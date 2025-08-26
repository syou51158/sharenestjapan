import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { NavigationHeader } from '../components/NavigationHeader';
import { Footer } from '../components/layout/Footer';

const MyBookings: NextPage = () => {
  const { t } = useTranslation('common');

  // サンプル予約データ
  const bookings = [
    {
      id: 1,
      carName: 'トヨタ プリウス',
      startDate: '2023-10-10T10:00',
      endDate: '2023-10-10T15:00',
      location: '東京都渋谷区',
      price: 7500,
      status: 'completed'
    },
    {
      id: 2,
      carName: 'ホンダ フィット',
      startDate: '2023-10-15T09:00',
      endDate: '2023-10-15T18:00',
      location: '東京都新宿区',
      price: 9000,
      status: 'upcoming'
    },
    {
      id: 3,
      carName: '日産 リーフ',
      startDate: '2023-10-20T12:00',
      endDate: '2023-10-20T17:00',
      location: '東京都品川区',
      price: 6000,
      status: 'upcoming'
    }
  ];

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // 予約のステータスに基づく表示
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">完了</span>;
      case 'upcoming':
        return <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">予定</span>;
      case 'cancelled':
        return <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">キャンセル</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <title>マイブッキング | ShareNest</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
  
      <NavigationHeader />
  
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-white mb-6">マイブッキング</h1>
  
        {bookings.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-white/80 mb-4">まだ予約はありません。</p>
            <Link href="/app/vehicles" className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all">
              車両を探す
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-3d glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{booking.vehicleTitle}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                    {booking.statusLabel}
                  </span>
                </div>
                <div className="space-y-2 text-white/90 text-sm">
                  <div className="flex justify-between"><span>予約ID</span><span>{booking.id}</span></div>
                  <div className="flex justify-between"><span>開始</span><span>{formatDate(booking.startDate)}</span></div>
                  <div className="flex justify-between"><span>終了</span><span>{formatDate(booking.endDate)}</span></div>
                  <div className="flex justify-between"><span>合計料金</span><span className="font-semibold">¥{booking.totalPrice}</span></div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href={`/app/bookings/${booking.id}`} className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-lg hover:bg-white/20 transition">
                    詳細
                  </Link>
                  {booking.canCancel && (
                    <button onClick={() => handleCancel(booking.id)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition">
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
  
      <Footer />
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

export default MyBookings;