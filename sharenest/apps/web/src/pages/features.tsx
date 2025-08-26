import { NavigationHeader } from '../components/NavigationHeader';

export default function Features() {
  const features = [
    {
      title: "オンライン予約・決済",
      description: "Stripe対応の安全で簡単な決済システム。Apple Pay、Google Payにも対応しています。",
      icon: "💳",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "受渡しチェックイン/チェックアウト",
      description: "スマートフォンで簡単にチェックイン・チェックアウト。QRコード読み取りでスムーズな受け渡し。",
      icon: "📱",
      color: "from-green-500 to-emerald-400"
    },
    {
      title: "デポジット・距離課金",
      description: "透明性の高い料金体系。デポジットは自動返金、距離課金はリアルタイムで計算。",
      icon: "💰",
      color: "from-purple-500 to-pink-400"
    },
    {
      title: "管理ダッシュボード",
      description: "予約状況、売上、返金処理を一括管理。リアルタイムでのデータ更新。",
      icon: "📊",
      color: "from-orange-500 to-red-400"
    },
    {
      title: "車両管理システム",
      description: "車両の状態、メンテナンス履歴、利用状況を一元管理。予防保全も自動化。",
      icon: "🚗",
      color: "from-indigo-500 to-purple-400"
    },
    {
      title: "マルチ言語対応",
      description: "日本語・英語・中国語に対応。海外のお客様も安心してご利用いただけます。",
      icon: "🌏",
      color: "from-teal-500 to-blue-400"
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
            <span className="gradient-text">ShareNestの機能</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            最先端のカーシェアリングプラットフォームを体験してください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="card-3d glass rounded-3xl p-8 hover:scale-105 transition-all duration-500">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
              </div>
              <p className="text-white/80 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">さらに詳しく</h3>
            <p className="text-white/70 text-lg mb-6">
              他にも便利な機能が満載です。ぜひ実際に体験してみてください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                デモを見る
              </button>
              <button className="px-6 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300">
                お問い合わせ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



