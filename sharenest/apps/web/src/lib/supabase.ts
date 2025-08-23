import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('Supabase環境変数が未設定です。ダミークライアントを返します。');
    // ダミークライアントを返す（実際のAPIは呼ばれない）
    cachedClient = createClient('https://dummy.supabase.co', 'dummy-key');
    return cachedClient;
  }
  // デフォルトは public スキーマ（必要に応じて .schema('sharenest') を明示）
  cachedClient = createClient(url, anon);
  return cachedClient;
}

export function getSbSchema() {
  return getSupabase().schema('sharenest');
}


