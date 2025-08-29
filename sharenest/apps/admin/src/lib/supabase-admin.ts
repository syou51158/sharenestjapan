import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 管理用 Supabase クライアント（サービスロールキー推奨）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fetchWithTimeout = (input: any, init: any = {}) => {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.SUPABASE_FETCH_TIMEOUT_MS) || 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const opts = { ...init, signal: controller.signal };
  return fetch(input, opts).finally(() => clearTimeout(timeoutId));
};

let supabaseAdminClient: SupabaseClient<any, any, 'sharenest', any, any>;
export const supabaseIsConfigured = Boolean(supabaseUrl && (serviceKey || anonKey));
export const supabaseMissing = {
  url: !supabaseUrl,
  bothKeysMissing: !serviceKey && !anonKey,
};
export const supabaseHasServiceKey = Boolean(serviceKey);

if (supabaseIsConfigured) {
  const keyToUse = serviceKey || anonKey!; // サービスキー無い場合は匿名鍵（RLS前提）
  supabaseAdminClient = createClient(supabaseUrl, keyToUse, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'sharenest' },
    global: { fetch: fetchWithTimeout },
  });
} else {
  // フェイルファスト: API側で supabaseIsConfigured をチェックして 500 を返す想定
  // ここでダミークライアントは作らない（ネットワークエラーを避ける）
  // ただし型のため一時的にダミー作成（使用しない）
  supabaseAdminClient = createClient('https://example.invalid', 'invalid', {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'sharenest' },
    global: { fetch: fetchWithTimeout },
  });
}

export const supabaseAdmin = supabaseAdminClient;
export const getAdminSchema = () => supabaseAdmin.schema('sharenest');


