import { NavigationHeader } from '../components/NavigationHeader';

export default function FAQ() {
  const faqs = [
    {
      question: "決済方法は？",
      answer: "Stripe（Apple Pay/Google Pay対応のカード）でお支払いいただけます。セキュアで安心な決済システムを採用しています。",
      icon: "💳"
    },
    {
      question: "デポジットは？",
      answer: "車両により異なります。利用後の追加請求がなければ自動返金されます。デポジットは完全に返金されます。",
      icon: "🔒"
    },
    {
      question: "充電は？",
      answer: "EVは返却時SOC60%以上が目安です。急速充電の費用は実費です。充電ステーションは全国に充実しています。",
      icon: "🔋"
    },
    {
      question: "予約のキャンセルは可能ですか？",
      answer: "開始24時間前まで無料でキャンセル可能です。それ以降はキャンセル料が発生する場合があります。",
      icon: "🔄"
    },
    {
      question: "保険は含まれていますか？",
      answer: "はい、全ての車両に対して保険が含まれています。万が一の際も安心してご利用いただけます。",
      icon: "🛡️"
    },
    {
      question: "年齢制限はありますか？",
      answer: "運転免許をお持ちの方であれば、年齢制限はありません。ただし、一定の運転経験が必要な車両もございます。",
      icon: "🚗"
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
            ご利用前の疑問にお答えします
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card-3d glass rounded-2xl p-8 hover:scale-105 transition-all duration-500">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{faq.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Q. {faq.question}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    A. {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">お困りですか？</h3>
            <p className="text-white/70 text-lg mb-6">
              その他ご不明な点がございましたら、お気軽にお問い合わせください
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
              お問い合わせ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







