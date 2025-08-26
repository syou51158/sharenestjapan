import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { localDb } from '../../../server/localDb';
import { getSbSchema } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const canUseSupabase = !!(supabaseUrl && supabaseAnonKey);

  if (canUseSupabase) {
    try {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await getSbSchema()
        .from('bookings')
        .select(`*, vehicles (make, model, year)`) 
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ bookings: data });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Server error' });
    }
  }

  // ローカルDBから
  return res.status(200).json({ bookings: localDb.bookings });
}


