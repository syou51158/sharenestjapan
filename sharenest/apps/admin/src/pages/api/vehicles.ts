import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminSchema, supabaseIsConfigured, supabaseMissing } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    if (!supabaseIsConfigured) {
      return res.status(500).json({ error: `Supabase env not configured: urlMissing=${supabaseMissing.url}, keysMissing=${supabaseMissing.bothKeysMissing}` });
    }
    // 仮の取得: sharenest.vehicles が前提。無ければ空配列で返す。
    const { data, error } = await getAdminSchema()
      .from('vehicles')
      .select('*')
      .limit(100);
    if (error && (error as any).code === '42P01') {
      // テーブルが無い場合は空配列で返して画面を動かす
      return res.status(200).json([]);
    }
    if (error) return res.status(500).json({ error: (error as any).message });
    return res.status(200).json(data || []);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}


