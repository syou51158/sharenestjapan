export default function Features() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">機能</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>オンライン予約・決済（Stripe）</li>
        <li>受渡しチェックイン/チェックアウト</li>
        <li>デポジット・距離課金対応</li>
        <li>管理ダッシュボード（予約・売上・返金）</li>
      </ul>
    </div>
  );
}



