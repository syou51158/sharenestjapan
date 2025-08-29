import type { NextPage } from 'next';

const TestPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">ShareNest</h1>
        <p className="text-xl text-gray-600 mb-8">システムテストページ</p>
        <div className="space-y-4">
          <div className="bg-green-100 text-green-800 p-4 rounded-xl">
            ✅ React/Next.js: 正常
          </div>
          <div className="bg-blue-100 text-blue-800 p-4 rounded-xl">
            ✅ Tailwind CSS: 正常
          </div>
          <div className="bg-purple-100 text-purple-800 p-4 rounded-xl">
            ✅ TypeScript: 正常
          </div>
        </div>
        <div className="mt-8">
          <a href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            メインページに戻る
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;








