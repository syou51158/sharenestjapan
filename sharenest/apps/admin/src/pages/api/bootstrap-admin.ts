import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseBrowser } from '../../lib/supabase-browser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'missing bearer token' });

    const primaryEmail = process.env.ADMIN_PRIMARY_EMAIL || 'syo.t.company@gmail.com';

    // ensure profile row exists
    const r1 = await supabaseBrowser.rpc('ensure_user_profile', {}, { headers: { Authorization: `Bearer ${token}` } as any });
    if (r1.error && (r1.error as any).message !== 'duplicate key value violates unique constraint') {
      // ignore benign duplicates
    }

    // grant admin if matches primary email
    const r2 = await supabaseBrowser.rpc('grant_admin_if_primary', { primary_email: primaryEmail }, { headers: { Authorization: `Bearer ${token}` } as any });
    if (r2.error) return res.status(500).json({ error: (r2.error as any).message });

    return res.status(200).json({ ok: true, granted: r2.data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}


