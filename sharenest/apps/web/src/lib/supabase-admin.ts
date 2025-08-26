import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント（サービスロールキー使用を優先）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// グローバルfetchにタイムアウトを付与
const fetchWithTimeout = (input: any, init: any = {}) => {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.SUPABASE_FETCH_TIMEOUT_MS) || 10000; // 10秒
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const opts = { ...init, signal: controller.signal };
  return fetch(input, opts).finally(() => clearTimeout(timeoutId));
};

let supabaseAdminClient: SupabaseClient;

if (supabaseUrl && (serviceKey || anonKey)) {
  const keyToUse = serviceKey || anonKey!; // サービスキーがない場合は匿名鍵でフォールバック（RLS依存）
  if (!serviceKey) {
    console.warn('[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to ANON key. Some write operations may fail due to RLS.');
  }
  supabaseAdminClient = createClient(supabaseUrl, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: { schema: 'sharenest' },
    global: { fetch: fetchWithTimeout },
  });
} else {
  console.error('[supabase-admin] Supabase environment variables are not set. Using dummy client.');
  // ダミークライアント（誤接続でのハング回避、実クエリは失敗する想定）
  supabaseAdminClient = createClient('https://dummy.supabase.co', 'dummy-key', {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'sharenest' },
    global: { fetch: fetchWithTimeout },
  });
}

export const supabaseAdmin = supabaseAdminClient;

// 管理者権限でのデータベース操作用ヘルパー関数
export const getAdminSchema = () => supabaseAdmin.schema('sharenest');