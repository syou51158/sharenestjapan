type Vehicle = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  powertrain: string;
  range_km: number;
  price_day: number;
  price_hour: number;
  price_per_km: number;
  deposit: number;
  pickup_points: string[];
  photos: string[];
  rules: string[];
};

export type PriceBreakdown = {
  base: number;
  distance: number;
  insurance: number;
  deposit: number;
  total: number;
};

export function calculatePrice(
  vehicle: Vehicle,
  hours: number,
  distanceKm: number,
  insuranceFlat = 1000
): PriceBreakdown {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  const base = days * vehicle.price_day + remainingHours * vehicle.price_hour;
  const distance = vehicle.price_per_km > 0 ? distanceKm * vehicle.price_per_km : 0;
  const deposit = vehicle.deposit;
  const insurance = insuranceFlat;
  const total = base + distance + insurance + deposit;

  return { base, distance, insurance, deposit, total };
}



