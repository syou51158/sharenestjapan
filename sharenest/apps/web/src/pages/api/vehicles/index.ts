import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: vehicles, error } = await supabaseAdmin
        .schema('sharenest')
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        return res.status(500).json({ error: 'Failed to fetch vehicles' });
      }

      // レビューデータを取得
      const vehicleIds = vehicles?.map(v => v.id) || [];
      const { data: reviewData } = await supabaseAdmin
        .schema('sharenest')
        .from('reviews')
        .select('rating, booking_id, bookings!inner(vehicle_id)')
        .in('bookings.vehicle_id', vehicleIds);

      // レビューデータを車両ごとに集計
      const enrichedVehicles = vehicles?.map((vehicle: any) => {
        const reviewsForVehicle = (reviewData || []).filter((r: any) => (r?.bookings?.vehicle_id) === vehicle.id);
        const ratings = reviewsForVehicle.map((r: any) => Number(r?.rating) || 0);
        const rating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        
        return {
          ...vehicle,
          rating: Math.round(rating * 10) / 10,
          reviews_count: ratings.length
        };
      });

      return res.status(200).json(enrichedVehicles || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const vehicleData = req.body;

      // 必須フィールドの検証
      const requiredFields = ['title', 'brand', 'model', 'year', 'seats', 'price_day', 'price_hour'];
      for (const field of requiredFields) {
        if (!vehicleData[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      const { data: vehicle, error } = await supabaseAdmin
        .schema('sharenest')
        .from('carsharing_vehicles')
        .insert({
          title: vehicleData.title,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: parseInt(vehicleData.year),
          seats: parseInt(vehicleData.seats),
          powertrain: vehicleData.powertrain || 'ガソリン',
          range_km: parseInt(vehicleData.range_km) || 0,
          price_day: parseFloat(vehicleData.price_day),
          price_hour: parseFloat(vehicleData.price_hour),
          price_per_km: parseFloat(vehicleData.price_per_km) || 0,
          deposit: parseFloat(vehicleData.deposit) || 0,
          pickup_points: vehicleData.pickup_points || ['京都駅'],
          photos: vehicleData.photos || [],
          rules: vehicleData.rules || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vehicle:', error);
        return res.status(500).json({ error: 'Failed to create vehicle' });
      }

      return res.status(201).json(vehicle);
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}