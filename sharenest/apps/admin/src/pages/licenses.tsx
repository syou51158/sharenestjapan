import { useEffect, useState } from 'react';
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

  useEffect(() => { fetchRows(); }, []);

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
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded bg-white/10 text-white">
            <option value="pending">審査中</option>
            <option value="verified">承認済み</option>
            <option value="rejected">却下</option>
            <option value="all">すべて</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="メール/名前検索" className="px-3 py-2 rounded bg-white/10 text-white flex-1" />
          <button onClick={fetchRows} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded">{loading ? '読込中' : '再読込'}</button>
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
                  <td className="p-3">{(r.driver_license as any)?.license_no || r['license_number'] || '-'}</td>
                  <td className="p-3">{(r.driver_license as any)?.status || '-'}</td>
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


