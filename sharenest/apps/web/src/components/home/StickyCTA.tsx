import Link from 'next/link';

export function StickyCTA() {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl rounded-full shadow-lg bg-blue-600 text-white flex items-center justify-between px-4 py-3">
          <span className="text-sm">空き状況を確認して今すぐ予約</span>
          <Link href="/app/vehicles" className="bg-white text-blue-700 font-medium px-4 py-1.5 rounded-full">車を探す</Link>
        </div>
      </div>
    </div>
  );
}





