export default function FAQ() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">FAQ</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Q. 決済方法は？</h2>
          <p>Stripe（Apple Pay/Google Pay対応のカード）でお支払いいただけます。</p>
        </div>
        <div>
          <h2 className="font-semibold">Q. デポジットは？</h2>
          <p>車両により異なります。利用後の追加請求がなければ自動返金されます。</p>
        </div>
        <div>
          <h2 className="font-semibold">Q. 充電は？</h2>
          <p>EVは返却時SOC60%以上が目安です。急速充電の費用は実費です。</p>
        </div>
      </div>
    </div>
  );
}



