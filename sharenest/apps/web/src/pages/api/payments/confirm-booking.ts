import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { localDb } from '../../../server/localDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { paymentIntentId, userId, vehicleId, hours, distanceKm, amount } = req.body;
    if (!paymentIntentId || !userId || !vehicleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canUseSupabase = !!(supabaseUrl && supabaseAnonKey);
    const supabase = canUseSupabase ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

    // 予約を作成
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1); // 明日から
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + Number(hours));

    if (canUseSupabase && supabase) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          vehicle_id: vehicleId,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          pickup_point: '京都駅',
          status: 'confirmed',
          payment_intent: paymentIntentId,
          distance_km: Number(distanceKm || 0),
          charges: {
            amount: Number(amount),
            currency: 'jpy',
            paid_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Booking creation error:', error);
        return res.status(500).json({ error: 'Failed to create booking' });
      }
      return res.status(200).json({ booking });
    } else {
      // ローカル保存
      const booking = {
        id: `loc_${Date.now()}`,
        user_id: userId,
        vehicle_id: vehicleId,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        pickup_point: '京都駅',
        status: 'confirmed',
        payment_intent: paymentIntentId,
        distance_km: Number(distanceKm || 0),
        charges: {
          amount: Number(amount),
          currency: 'jpy',
          paid_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      } as any;
      localDb.bookings.unshift(booking);
      return res.status(200).json({ booking });
    }
  } catch (e: any) {
    console.error('Confirm booking error:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}

