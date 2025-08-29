import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAsUser } from '../../lib/supabase-as-user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'missing bearer token' });

    const client = getSupabaseAsUser(token);

    // bootstrap
    const primaryEmail = process.env.ADMIN_PRIMARY_EMAIL || 'syo.t.company@gmail.com';
    await client.rpc('ensure_user_profile');
    await client.rpc('grant_admin_if_primary', { primary_email: primaryEmail });

    const status = (req.query.status as string) || null;
    const q = (req.query.q as string) || null;
    const { data, error } = await client.rpc('list_driver_licenses', { p_status: status, p_q: q });

    if (error) return res.status(500).json({ error: (error as any).message });
    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}


