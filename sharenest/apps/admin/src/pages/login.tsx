import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabaseBrowser } from '../lib/supabase-browser';
import { buildUrl } from '../lib/site';
import AdminHeader from '../components/AdminHeader';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/licenses';
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const redirectTo = buildUrl('/licenses');
    const { error } = await supabaseBrowser.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head><title>管理ログイン - ShareNest</title></Head>
      <AdminHeader active={undefined} />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto glass rounded-3xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">管理ログイン</h1>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <button onClick={signInWithGoogle} disabled={loading} className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">
            {loading ? 'リダイレクト中...' : 'Googleでログイン'}
          </button>
        </div>
      </main>
    </div>
  );
}


