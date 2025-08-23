import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const FindCar: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{`${t('findCar')} | ShareNest`}</title>
        <meta name="description" content={String(t('findCar'))} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">ShareNest</Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/find-car" className="font-medium text-blue-600">
                  {t('findCar')}
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="font-medium text-gray-600 hover:text-blue-600">
                  {t('myBookings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('findCar')}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">検索条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="東京、大阪など" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日時</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日時</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
            検索
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* サンプルカー */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">トヨタ プリウス</h3>
                <p className="text-gray-600 mb-2">東京都渋谷区</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">¥1,500/時</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                    詳細を見る
                  </button>
                </div>
              </div>
            </div>
          ))}
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

export default FindCar; 