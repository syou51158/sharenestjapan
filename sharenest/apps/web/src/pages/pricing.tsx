export default function Pricing() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">料金</h1>
      <p className="mb-4">料金はベース（日/時）＋距離課金（¥25/km。SAKURAは距離課金なし）＋保険/特約（固定）＋デポジットで構成されます。</p>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2">項目</th>
            <th className="p-2">料率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">遅延返却</td>
            <td className="p-2">¥2,000/時</td>
          </tr>
          <tr>
            <td className="p-2">清掃費</td>
            <td className="p-2">¥5,000 〜</td>
          </tr>
          <tr>
            <td className="p-2">未充電（EV返却SOC基準違反）</td>
            <td className="p-2">¥3,000 + 実費</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}



