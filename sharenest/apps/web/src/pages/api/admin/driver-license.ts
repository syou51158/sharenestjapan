import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAdminSchema } from '../../../lib/supabase-admin';

type Action = 'approve' | 'reject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: missing bearer token' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return res.status(500).json({ error: 'Supabase env is not configured' });
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: userResult, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userResult?.user) {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }

    const adminUserId = userResult.user.id;
    const { data: adminProfile, error: adminErr } = await getAdminSchema()
      .from('users')
      .select('id, role')
      .eq('id', adminUserId)
      .maybeSingle();

    if (adminErr) {
      return res.status(500).json({ error: adminErr.message });
    }
    if (!adminProfile || adminProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    const { userId, action, reason } = req.body as { userId?: string; action?: Action; reason?: string };
    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Bad Request: userId and valid action required' });
    }

    const { data: current, error: fetchErr } = await getAdminSchema()
      .from('users')
      .select('driver_license')
      .eq('id', userId)
      .maybeSingle();
    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message });
    }

    const nextStatus = action === 'approve' ? 'verified' : 'rejected';
    const nextDriverLicense = {
      ...(current?.driver_license || {}),
      status: nextStatus,
      ...(reason ? { rejection_reason: action === 'reject' ? reason : null } : {}),
    } as Record<string, any>;

    const { data: updated, error: updateErr } = await getAdminSchema()
      .from('users')
      .update({ driver_license: nextDriverLicense, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, driver_license')
      .maybeSingle();

    if (updateErr) {
      return res.status(500).json({ error: updateErr.message });
    }

    return res.status(200).json({ message: 'Driver license status updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}


