export type LocalBooking = {
  id: string;
  user_id: string;
  vehicle_id: string;
  start_at: string;
  end_at: string;
  pickup_point: string;
  status: string;
  payment_intent: string;
  distance_km: number;
  charges: { amount: number; currency: string; paid_at: string };
  created_at: string;
};

export const localDb: { bookings: LocalBooking[] } = {
  bookings: [],
};


