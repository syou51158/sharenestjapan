import { NavigationHeader } from '../components/NavigationHeader';
import { Footer } from '../components/layout/Footer';

export default function FAQPage() {
  const faqs = [
    {
      question: "予約の変更やキャンセルはできますか？",
      answer: "予約開始24時間前までのキャンセルは手数料無料です。それ以降は所定の手数料がかかります。変更は予約開始前であれば可能です。"
    },
    {
      question: "支払い方法は何がありますか？",
      answer: "クレジットカード（Visa/Master/Amex）、Apple Pay、Google Payに対応しています。"
    },
    {
      question: "保険は含まれていますか？",
      answer: "基本料金に対物・対人保険が含まれます。免責補償の追加も可能です。"
    },
    {
      question: "領収書は発行できますか？",
      answer: "はい、予約完了後のマイページからPDF形式でダウンロード可能です。"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <NavigationHeader />
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <span className="gradient-text">よくある質問</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            お客様からよくいただくご質問と回答をまとめました
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {faqs.map((item, index) => (
            <div key={index} className="card-3d glass rounded-3xl p-8 hover:scale-105 transition-all duration-500">
              <h2 className="text-2xl font-bold text-white mb-4">{item.question}</h2>
              <p className="text-white/80 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">解決しない場合は</h3>
            <p className="text-white/70 text-lg mb-6">
              お問い合わせフォームからお気軽にご相談ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                お問い合わせ
              </button>
              <button className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300">
                ガイドラインを読む
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}










