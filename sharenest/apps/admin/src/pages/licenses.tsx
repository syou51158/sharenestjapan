import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import AdminHeader from '../components/AdminHeader';

type Row = {
  id: string;
  name: string;
  email: string;
  driver_license: { status?: string; license_no?: string; expiry_date?: string } | null;
  is_verified: boolean;
  created_at: string;
};

export default function LicenseReviewPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [q, setQ] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (q) params.set('q', q);
      const token = (await (window as any).supabase?.auth?.getSession?.())?.data?.session?.access_token;
      const res = await fetch(`/api/licenses?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'failed');
      setRows(json.data || []);
    } catch (e) {
      console.error(e);
      alert('一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const action = async (userId: string, a: 'approve' | 'reject') => {
    try {
      const token = (await (window as any).supabase?.auth?.getSession?.())?.data?.session?.access_token;
      const res = await fetch('/api/license-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userId, action: a }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'failed');
      await fetchRows();
    } catch (e) {
      console.error(e);
      alert((e as Error).message || '更新に失敗しました');
    }
  };

  useEffect(() => {
    // ステータス変更時は即座に実行
    fetchRows();
  }, [status]);

  useEffect(() => {
    // 検索文字列変更時はデバウンス処理
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchRows();
    }, 500);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [q]);

  useEffect(() => {
    // セッションがない場合はログインへ誘導
    (async () => {
      const { data } = await (window as any).supabase?.auth?.getSession?.();
      if (!data?.session) {
        // stay but header has login; optionally redirect
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <AdminHeader active="licenses" />
      <Head>
        <title>免許審査 - ShareNest 管理</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">免許審査</h1>

        <div className="glass rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="relative group">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 appearance-none cursor-pointer pr-8">
              <option value="pending" className="bg-slate-800 text-white">審査中</option>
              <option value="verified" className="bg-slate-800 text-white">承認済み</option>
              <option value="rejected" className="bg-slate-800 text-white">却下</option>
              <option value="all" className="bg-slate-800 text-white">すべて</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="メール/名前検索" className="px-3 py-2 rounded bg-slate-800/80 text-white border border-slate-600 hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 flex-1" />
          <button onClick={fetchRows} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">{loading ? '検索中...' : '検索'}</button>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-white">
              <tr>
                <th className="p-3">ユーザー</th>
                <th className="p-3">メール</th>
                <th className="p-3">免許番号</th>
                <th className="p-3">状態</th>
                <th className="p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10 text-white/90">
                  <td className="p-3">{r.name || '-'}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.driver_license?.license_no || '-'}</td>
                  <td className="p-3">{r.driver_license?.status || '-'}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => action(r.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded">承認</button>
                    <button onClick={() => action(r.id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded">却下</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-4 text-white/60" colSpan={5}>データがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


