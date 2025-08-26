import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

// ネットワークハング対策: タイムアウト付きfetch（デフォルト10秒）
const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit & { timeout?: number }) => {
  const timeout = init?.timeout ?? 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('Supabase環境変数が未設定です。ダミークライアントを返します。');
    // ダミークライアントを返す（実際のAPIは呼ばれない）。スキーマは sharenest に合わせる。
    cachedClient = (createClient('https://dummy.supabase.co', 'dummy-key', {
      db: { schema: 'sharenest' },
      global: {
        fetch: fetchWithTimeout,
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
    }) as unknown) as SupabaseClient;
    return cachedClient;
  }
  // すべてのクライアント生成をこの関数に集約し、スキーマは sharenest を使用
  cachedClient = (createClient(url, anon, {
    db: { schema: 'sharenest' },
    global: {
      fetch: fetchWithTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation',
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  }) as unknown) as SupabaseClient;
  return cachedClient;
}

export function getSbSchema() {
  // 共通の単一クライアントを返す（重複インスタンスを避ける）
  return getSupabase();
}

// ストレージ専用のクライアント（Content-Typeヘッダーを設定しない）
export function getSupabaseForStorage(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('Supabase環境変数が未設定です。ダミークライアントを返します。');
    return (createClient('https://dummy.supabase.co', 'dummy-key', {
      db: { schema: 'sharenest' },
      global: {
        fetch: fetchWithTimeout,
        headers: {
          'Accept': 'application/json',
          'Prefer': 'return=representation',
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }) as unknown) as SupabaseClient;
  }
  
  // ストレージ用：Content-Typeヘッダーを除外
  return (createClient(url, anon, {
    db: { schema: 'sharenest' },
    global: {
      fetch: fetchWithTimeout,
      headers: {
        'Accept': 'application/json',
        'Prefer': 'return=representation',
        // Content-Typeヘッダーを意図的に除外（ブラウザが自動設定）
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  }) as unknown) as SupabaseClient;
}


