import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAsUser } from '../../lib/supabase-as-user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, action, reason } = req.body as { userId?: string; action?: 'approve' | 'reject'; reason?: string };
    if (!userId || !action) return res.status(400).json({ error: 'userId and action are required' });

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'missing bearer token' });

    const client = getSupabaseAsUser(token);

    const nextStatus = action === 'approve' ? 'verified' : 'rejected';
    const { data, error } = await client.rpc(
      'update_driver_license_status',
      { p_user_id: userId, p_new_status: nextStatus, p_reason: reason || null }
    );
    if (error) return res.status(500).json({ error: (error as any).message });
    return res.status(200).json({ data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}
