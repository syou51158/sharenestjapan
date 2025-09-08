import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '../lib/supabase-browser';

export default function AdminHeader({ active }: { active?: 'dashboard' | 'bookings' | 'vehicles' | 'licenses' }) {
  const base = 'text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300';
  const activeCls = 'glass px-4 py-2 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300';
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabaseBrowser.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => setUser(data.user));
    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  return (
    <div className="glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <h1 className="text-2xl font-black gradient-text-blue">ShareNest 管理</h1>
          </div>
          <nav className="flex space-x-6 items-center">
            <Link href="/" className={active === 'dashboard' ? activeCls : base}>📊 ダッシュボード</Link>
            <Link href="/bookings" className={active === 'bookings' ? activeCls : base}>📅 予約管理</Link>
            <Link href="/vehicles" className={active === 'vehicles' ? activeCls : base}>🚗 車両管理</Link>
            <Link href="/licenses" className={active === 'licenses' ? activeCls : base}>🪪 免許審査</Link>
            {!user ? (
              <Link href="/login" className={base}>🔐 ログイン</Link>
            ) : (
              <div className="flex items-center gap-3">
                <img src={user.user_metadata?.avatar_url || '/api/placeholder/40/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-white/80 text-sm">{user.email}</span>
                <button
                  onClick={() => supabaseBrowser.auth.signOut().then(() => (window.location.href='/'))}
                  className={base}
                >
                  退出
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}


