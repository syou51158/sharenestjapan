import Link from 'next/link';

export function FaqPreview() {
  const items = [
    { q: '決済/デポジットは？', a: 'Stripe決済に対応。車両により¥30,000〜¥50,000のデポジットをお預かりします。' },
    { q: '充電/ガソリンは？', a: 'EVは返却時SOC60%以上、ICEは満タン返却が目安です。' },
    { q: '遅延や清掃のペナルティは？', a: '遅延は¥2,000/時、清掃費は状態により¥5,000〜。' },
  ];
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold mb-4">よくある質問</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border p-4 bg-white">
            <h3 className="font-medium mb-1">Q. {it.q}</h3>
            <p className="text-sm text-gray-600">{it.a}</p>
          </div>
        ))}
      </div>
      <Link href="/faq" className="text-blue-600 hover:underline inline-block mt-3">もっと見る</Link>
    </section>
  );
}



