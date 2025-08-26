import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント（サービスロールキー使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'sharenest'
  }
});

// 管理者権限でのデータベース操作用ヘルパー関数
export const getAdminSchema = () => {
  return supabaseAdmin.schema('sharenest');
};