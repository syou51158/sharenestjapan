import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">ShareNest Japan</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/features" className="hover:underline">機能</Link>
          <Link href="/pricing" className="hover:underline">料金</Link>
          <Link href="/faq" className="hover:underline">FAQ</Link>
          <Link href="/app/vehicles" className="bg-blue-600 text-white px-3 py-1.5 rounded">車を探す</Link>
        </nav>
      </div>
    </header>
  );
}












