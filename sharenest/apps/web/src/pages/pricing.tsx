import { NavigationHeader } from '../components/NavigationHeader';

export default function Pricing() {
  const pricingPlans = [
    {
      name: "基本料金体系",
      description: "シンプルで透明性の高い料金設定",
      features: [
        { item: "ベース料金", rate: "日/時単位" },
        { item: "距離課金", rate: "¥25/km（SAKURAは距離課金なし）" },
        { item: "保険・特約", rate: "固定料金" },
        { item: "デポジット", rate: "車両により異なる" }
      ],
      icon: "💰"
    },
    {
      name: "追加料金",
      description: "発生時のみ適用される料金",
      features: [
        { item: "遅延返却", rate: "¥2,000/時" },
        { item: "清掃費", rate: "¥5,000〜" },
        { item: "未充電（EV）", rate: "¥3,000 + 実費" },
        { item: "追加走行", rate: "¥25/km" }
      ],
      icon: "⚠️"
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
            <span className="gradient-text">料金体系</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            シンプルで透明性の高い料金設定で、安心してご利用いただけます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="card-3d glass rounded-3xl p-8 hover:scale-105 transition-all duration-500">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{plan.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-white/70">{plan.description}</p>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 glass rounded-xl">
                    <span className="text-white font-medium">{feature.item}</span>
                    <span className="gradient-text font-bold">{feature.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="glass rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text白 mb-4">料金計算の仕組み</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="text-white font-bold mb-1">ベース料金</h4>
                <p className="text-white/70 text-sm">日/時単位</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🛣️</div>
                <h4 className="text-white font-bold mb-1">距離課金</h4>
                <p className="text-white/70 text-sm">¥25/km</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="text-white font-bold mb-1">保険</h4>
                <p className="text-white/70 text-sm">固定料金</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">💳</div>
                <h4 className="text-white font-bold mb-1">デポジット</h4>
                <p className="text-white/70 text-sm">車両により異なる</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






