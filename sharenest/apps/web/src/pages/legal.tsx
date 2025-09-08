import { NavigationHeader } from '../components/NavigationHeader';
import { Footer } from '../components/layout/Footer';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <NavigationHeader />
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 pt-24 space-y-8">
        <section className="glass rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-4 text-white">
            <span className="gradient-text">利用規約（ドラフト）</span>
          </h1>
          <p className="text-white/80">本サービスは共同使用契約/許可保 事業者との連携により運用されます。利用者は予約時点で最新の約款に同意したものとみなします。</p>
        </section>
        <section className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-2 text-white">プライバシーポリシー（ドラフト）</h2>
          <p className="text-white/80">個人情報は予約・決済・本人確認に必要な範囲で取得し、法令に基づき適切に管理します。</p>
        </section>
        <section className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-2 text-white">特定商取引法に基づく表記（ドラフト）</h2>
          <p className="text-white/80">事業者名: Trend Company株式会社 / 連絡先: syou51158@gmail.com / 提供地域: 京都・大阪・滋賀 予定</p>
        </section>
        <section className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-2 text-white">クッキーポリシー（ドラフト）</h2>
          <p className="text-white/80">解析・改善のためにCookieを使用します。ブラウザ設定で無効化可能です。</p>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}















