export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Trend Company株式会社</p>
        <div className="flex gap-4">
          <a href="/legal" className="hover:underline">法務</a>
          <a href="/contact" className="hover:underline">お問い合わせ</a>
        </div>
      </div>
    </footer>
  );
}






