import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{`${t('myBookings')} | ShareNest`}</title>
        <meta name="description" content={String(t('myBookings'))} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">ShareNest</Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/find-car" className="font-medium text-gray-600 hover:text-blue-600">
                  {t('findCar')}
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="font-medium text-blue-600">
                  {t('myBookings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('myBookings')}</h1>
        
        <div className="bg-white rounded-lg shadow-md">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車種
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期間
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      場所
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      料金
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{booking.carName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.startDate)} 〜 <br />
                          {formatDate(booking.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">¥{booking.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusDisplay(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900">
                          詳細
                        </Link>
                        {booking.status === 'upcoming' && (
                          <span className="ml-3 text-red-600 hover:text-red-900 cursor-pointer">
                            キャンセル
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              予約履歴はありません
            </div>
          )}
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

export default MyBookings; 