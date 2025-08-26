import { NavigationHeader } from '../components/NavigationHeader';
import { Footer } from '../components/layout/Footer';

export default function Pricing() {
  const plans = [
    {
      name: "ライト",
      price: "¥200/15分",
      subtitle: "短時間利用に最適",
      features: ["15分単位の料金", "基本保険込み", "24時間利用可能", "アプリで簡単予約"],
      highlight: false,
      popular: false
    },
    {
      name: "スタンダード",
      price: "¥2,500/6時間",
      subtitle: "半日利用におすすめ",
      features: ["6時間パック", "ガソリン代込み", "免責補償付き", "延長料金¥200/15分"],
      highlight: true,
      popular: true
    },
    {
      name: "デイリー",
      price: "¥4,800/24時間",
      subtitle: "1日たっぷり使いたい方に",
      features: ["24時間パック", "距離制限なし", "フル保険適用", "無料キャンセル（2時間前まで）"],
      highlight: false,
      popular: false
    }
  ];

  const additionalInfo = [
    {
      title: "距離料金",
      description: "基本料金に加えて¥16/kmの距離料金が発生します"
    },
    {
      title: "燃料費",
      description: "ガソリン代は料金に含まれています（返却時の給油不要）"
    },
    {
      title: "保険・補償",
      description: "対人・対物無制限、車両保険付き（免責金額：¥10万円）"
    },
    {
      title: "延長料金",
      description: "予約時間を超過した場合、15分単位で¥200の延長料金"
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
            <span className="gradient-text">料金プラン</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            用途に合わせて最適な料金プランをお選びください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-3d glass rounded-3xl p-8 hover:scale-105 transition-all duration-500 relative ${
                plan.highlight ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    人気No.1
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-cyan-400 text-sm">{plan.subtitle}</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-black text-white">{plan.price}</div>
                <p className="text-white/60 text-sm mt-1">+ 距離料金¥16/km</p>
              </div>
              <ul className="space-y-3 text-white/80 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-cyan-400">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <button
                  className={`w-full px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-blue-600'
                      : 'border border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  このプランで予約
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 追加料金情報 */}
        <div className="glass rounded-3xl p-8 max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">料金詳細</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalInfo.map((info, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">{info.title}</h4>
                <p className="text-white/80">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">今すぐ始めよう</h3>
            <p className="text-white/70 text-lg mb-6">
              アカウント登録は無料。すぐに車を予約して、新しい移動体験を始めましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                無料で始める
              </button>
              <button className="px-8 py-4 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300">
                車を探す
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}







