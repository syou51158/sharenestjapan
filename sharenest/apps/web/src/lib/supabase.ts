import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('Supabase環境変数が未設定です。ダミークライアントを返します。');
    // ダミークライアントを返す（実際のAPIは呼ばれない）。スキーマは sharenest に合わせる。
    cachedClient = createClient('https://dummy.supabase.co', 'dummy-key', {
      db: { schema: 'sharenest' },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation',
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  }
  // すべてのクライアント生成をこの関数に集約し、スキーマは sharenest を使用
  cachedClient = createClient(url, anon, {
    db: { schema: 'sharenest' },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation',
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return cachedClient;
}

export function getSbSchema() {
  // 共通の単一クライアントを返す（重複インスタンスを避ける）
  return getSupabase();
}


