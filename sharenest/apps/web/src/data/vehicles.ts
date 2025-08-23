export type Powertrain = 'EV' | 'Hybrid' | 'ICE' | 'Hybrid/ICE（実車に合わせて）';

export type Vehicle = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  powertrain: Powertrain | string;
  range_km: number | null;
  price_day: number; // 円/日
  price_hour: number; // 円/時
  price_per_km: number; // 円/km
  deposit: number; // 円
  pickup_points: string[];
  rules: string[];
  photos?: string[];
};

export const VEHICLES: Vehicle[] = [
  {
    id: 'sakura-2023',
    title: '日産 SAKURA（EV・街乗り向け）',
    brand: 'Nissan',
    model: 'SAKURA',
    year: 2023,
    seats: 4,
    powertrain: 'EV',
    range_km: 100,
    price_day: 5000,
    price_hour: 700,
    price_per_km: 0,
    deposit: 30000,
    pickup_points: ['京都駅', '四条河原町'],
    rules: ['返却時SOC60%以上', '禁煙', 'ペット要相談', '急速充電は実費'],
    photos: ['/images/vehicles/sakura.jpg'],
  },
  {
    id: 'model3p-2022',
    title: 'Tesla Model 3 Performance 2022（ロングドライブ）',
    brand: 'Tesla',
    model: 'Model 3 Performance',
    year: 2022,
    seats: 5,
    powertrain: 'EV',
    range_km: 400,
    price_day: 20000,
    price_hour: 0,
    price_per_km: 25,
    deposit: 50000,
    pickup_points: ['京都駅', '大阪・梅田'],
    rules: ['Supercharger利用ルール順守', '禁煙/飲食注意', '段差/縁石注意', '洗車基準あり'],
    photos: ['/images/vehicles/model3.jpg'],
  },
  {
    id: 'eqb350-2022',
    title: 'Mercedes EQB350 2022（ファミリー/グループ）',
    brand: 'Mercedes-Benz',
    model: 'EQB 350',
    year: 2022,
    seats: 7,
    powertrain: 'EV',
    range_km: 350,
    price_day: 23000,
    price_hour: 0,
    price_per_km: 25,
    deposit: 50000,
    pickup_points: ['京都駅', '大阪・梅田'],
    rules: ['チャイルドシート有料オプション', '禁煙', '返却SOC60%以上', '車内汚れ/清掃費基準あり'],
    photos: ['/images/vehicles/eqb.jpg'],
  },
  {
    id: 'alphard-2024',
    title: 'TOYOTA アルファード 2024（ラグジュアリー）',
    brand: 'TOYOTA',
    model: 'ALPHARD',
    year: 2024,
    seats: 7,
    powertrain: 'Hybrid/ICE（実車に合わせて）',
    range_km: null,
    price_day: 26000,
    price_hour: 0,
    price_per_km: 25,
    deposit: 50000,
    pickup_points: ['京都駅', '大阪・梅田'],
    rules: ['禁煙', '大荷物時は事前申告', '内装保護マット厳守', '清掃費/遅延返却ペナルティあり'],
    photos: ['/images/vehicles/alphard.jpg'],
  },
];



