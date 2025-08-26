import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSbSchema } from '../../../lib/supabase';

type VehicleRow = {
  id: string;
  daily_rate: number;
  hourly_rate: number;
};

function calcAmount(v: VehicleRow, hours: number, distanceKm: number) {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const base = days * v.daily_rate + remainingHours * v.hourly_rate;
  const distance = 0; // Trendスキーマでは従量課金レート未定のため0計上
  const insurance = 1000;
  const deposit = 0;
  const total = base + distance + insurance + deposit;
  return { base, distance, insurance, deposit, total };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { vehicleId, hours, distanceKm } = req.body as { vehicleId: string; hours: number; distanceKm: number };
    if (!vehicleId || !hours?.toString()) return res.status(400).json({ error: 'invalid params' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Supabase から取得を試行（Trend Company: public.carsharing_vehicles）
    let vehicle: VehicleRow | null = null;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: v } = await getSbSchema()
          .from('vehicles')
          .select('id, price_day, price_hour')
          .eq('id', vehicleId)
          .single();
        if (v) {
          vehicle = {
            id: v.id,
            daily_rate: v.price_day,
            hourly_rate: v.price_hour
          } as VehicleRow;
        }
      } catch {}
    }
    // 車両が見つからない場合はエラーを返す
    if (!vehicle) {
      return res.status(404).json({ error: 'vehicle not found' });
    }

    const breakdown = calcAmount(vehicle as VehicleRow, Number(hours), Number(distanceKm || 0));
    const amount = Math.max(50, Math.round(breakdown.total));

    // Stripe 未設定時はモックを返す
    if (!stripeKey) {
      return res.status(200).json({ clientSecret: `pi_mock_${Date.now()}_secret_mock`, breakdown, amount, mock: true });
    }

    const stripe = new Stripe(stripeKey);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      automatic_payment_methods: { enabled: true },
      metadata: {
        vehicleId,
        hours: String(hours),
        distanceKm: String(distanceKm ?? 0),
      },
    });

    return res.status(200).json({ clientSecret: intent.client_secret, breakdown, amount });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server error' });
  }
}



