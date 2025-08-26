import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Vehicle ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {

  try {
    // IDがUUID形式かスラッグ形式かを判定
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = supabaseAdmin
      .schema('sharenest')
      .from('vehicles')
      .select('*');
    
    if (isUUID) {
      // UUIDの場合はidで検索
      query = query.eq('id', id);
    } else {
      // スラッグの場合はbrandとmodelで検索
      const parts = id.split('-');
      if (parts.length >= 2) {
        const year = parts[parts.length - 1];
        const modelParts = parts.slice(0, -1);
        const model = modelParts.join(' ').toUpperCase();
        
        query = query.ilike('model', `%${model}%`).eq('year', parseInt(year));
      } else {
        // フォールバック: titleで部分一致検索
        query = query.ilike('title', `%${id}%`);
      }
    }
    
    const { data: vehicle, error } = await query.single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch vehicle data' });
    }

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // レビューデータを取得して集計
    const { data: reviewData } = await supabaseAdmin
      .schema('sharenest')
      .from('reviews')
      .select('rating, bookings!inner(vehicle_id)')
      .eq('bookings.vehicle_id', vehicle.id);

    const ratings = reviewData?.map(r => r.rating) || [];
    const rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const vehicleWithReviews = {
      ...vehicle,
      rating: Math.round(rating * 10) / 10,
      reviews_count: ratings.length
    };

    res.status(200).json(vehicleWithReviews);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const vehicleData = req.body;

    // 更新可能なフィールドのみを抽出
    const updateData: any = {};
    const allowedFields = [
      'title', 'brand', 'model', 'year', 'seats', 'powertrain', 'range_km',
      'price_day', 'price_hour', 'price_per_km', 'deposit', 'pickup_points', 'photos', 'rules'
    ];

    for (const field of allowedFields) {
      if (vehicleData[field] !== undefined) {
        if (['year', 'seats', 'range_km'].includes(field)) {
          updateData[field] = parseInt(vehicleData[field]);
        } else if (['price_day', 'price_hour', 'price_per_km', 'deposit'].includes(field)) {
          updateData[field] = parseFloat(vehicleData[field]);
        } else {
          updateData[field] = vehicleData[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: vehicle, error } = await supabaseAdmin
      .schema('sharenest')
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      console.error('Error updating vehicle:', error);
      return res.status(500).json({ error: 'Failed to update vehicle' });
    }

    return res.status(200).json(vehicle);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // 車両に関連する予約があるかチェック
    const { data: bookings, error: bookingError } = await supabaseAdmin
      .schema('sharenest')
      .from('bookings')
      .select('id')
      .eq('vehicle_id', id)
      .limit(1);

    if (bookingError) {
      console.error('Error checking bookings:', bookingError);
      return res.status(500).json({ error: 'Failed to check vehicle bookings' });
    }

    if (bookings && bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete vehicle with existing bookings' });
    }

    const { error } = await supabaseAdmin
      .schema('sharenest')
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return res.status(500).json({ error: 'Failed to delete vehicle' });
    }

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}