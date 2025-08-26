import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { NavigationHeader } from '../../../../components/NavigationHeader';

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  powertrain: string;
  range_km: number | null;
  price_day: number;
  price_hour: number;
  price_per_km: number;
  deposit: number;
  status: 'available' | 'rented' | 'maintenance';
  location: string;
  pickup_points: string[];
  photos: string[];
  totalBookings: number;
  monthlyRevenue: number;
  created_at: string;
  updated_at: string;
}

export default function OwnerVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // TODO: 実際のAPIから取得
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        title: '日産 SAKURA - 京都駅近く',
        brand: '日産',
        model: 'SAKURA',
        year: 2023,
        seats: 4,
        powertrain: 'electric',
        range_km: 180,
        price_day: 8000,
        price_hour: 1000,
        price_per_km: 20,
        deposit: 10000,
        status: 'rented',
        location: '京都府京都市下京区',
        pickup_points: ['京都駅八条口', 'イオンモール京都'],
        photos: ['/api/placeholder/400/300'],
        totalBookings: 15,
        monthlyRevenue: 35000,
        created_at: '2024-01-15',
        updated_at: '2025-01-20'
      },
      {
        id: '2',
        title: 'Tesla Model 3 - 大阪梅田',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        seats: 5,
        powertrain: 'electric',
        range_km: 400,
        price_day: 15000,
        price_hour: 2000,
        price_per_km: 30,
        deposit: 20000,
        status: 'available',
        location: '大阪府大阪市北区',
        pickup_points: ['梅田駅', 'グランフロント大阪'],
        photos: ['/api/placeholder/400/300'],
        totalBookings: 8,
        monthlyRevenue: 50000,
        created_at: '2024-02-01',
        updated_at: '2025-01-18'
      },
      {
        id: '3',
        title: 'Mercedes EQS - 神戸三宮',
        brand: 'Mercedes',
        model: 'EQS',
        year: 2023,
        seats: 5,
        powertrain: 'electric',
        range_km: 500,
        price_day: 25000,
        price_hour: 3000,
        price_per_km: 40,
        deposit: 30000,
        status: 'maintenance',
        location: '兵庫県神戸市中央区',
        pickup_points: ['三宮駅', 'ポートアイランド'],
        photos: ['/api/placeholder/400/300'],
        totalBookings: 0,
        monthlyRevenue: 0,
        created_at: '2024-12-01',
        updated_at: '2025-01-10'
      }
    ];

    setVehicles(mockVehicles);
    setLoading(false);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '利用可能';
      case 'rented': return '貸出中';
      case 'maintenance': return 'メンテナンス';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/20';
      case 'rented': return 'text-blue-400 bg-blue-400/20';
      case 'maintenance': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      // TODO: 実際のAPI呼び出し
      console.log(`車両 ${vehicleId} のステータスを ${newStatus} に変更`);
      
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, status: newStatus as 'available' | 'rented' | 'maintenance' }
          : vehicle
      ));
    } catch (error) {
      console.error('ステータス変更エラー:', error);
      alert('ステータスの変更に失敗しました。');
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      // TODO: 実際のAPI呼び出し
      console.log(`車両 ${selectedVehicle.id} を削除`);
      
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== selectedVehicle.id));
      setShowDeleteModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('車両削除エラー:', error);
      alert('車両の削除に失敗しました。');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Head>
          <title>車両管理 | ShareNest</title>
        </Head>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-white/80">車両情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head>
        <title>車両管理 | ShareNest</title>
        <meta name="description" content="登録済み車両の管理・編集・削除" />
      </Head>

      <NavigationHeader />

      <main className="container mx-auto px-4 py-12">
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            車両管理
          </h1>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            登録済み車両の管理・編集・削除
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/app/owner/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← ダッシュボードに戻る
          </Link>
          <Link
            href="/app/owner/vehicles/add"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
          >
            + 新しい車両を登録
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🚗</div>
            <h3 className="text-lg font-bold text-white mb-1">総車両数</h3>
            <p className="text-3xl font-black gradient-text-blue">{vehicles.length}</p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-bold text-white mb-1">利用可能</h3>
            <p className="text-3xl font-black gradient-text-green">
              {vehicles.filter(v => v.status === 'available').length}
            </p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="text-lg font-bold text-white mb-1">貸出中</h3>
            <p className="text-3xl font-black gradient-text-blue">
              {vehicles.filter(v => v.status === 'rented').length}
            </p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🔧</div>
            <h3 className="text-lg font-bold text-white mb-1">メンテナンス</h3>
            <p className="text-3xl font-black gradient-text-orange">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </p>
          </div>
        </div>

        {/* 車両一覧 */}
        {vehicles.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">🚗</div>
            <h2 className="text-2xl font-bold text-white mb-4">まだ車両が登録されていません</h2>
            <p className="text-white/70 mb-8">最初の車両を登録してカーシェアリングを開始しましょう</p>
            <Link
              href="/app/owner/vehicles/add"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
            >
              車両を登録する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-300">
                {/* 車両画像 */}
                <div className="relative mb-4">
                  <img
                    src={vehicle.photos[0] || '/api/placeholder/400/300'}
                    alt={vehicle.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>

                {/* 車両情報 */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{vehicle.title}</h3>
                  <p className="text-white/70 text-sm mb-2">
                    {vehicle.brand} {vehicle.model} ({vehicle.year}年)
                  </p>
                  <p className="text-white/60 text-sm">{vehicle.location}</p>
                </div>

                {/* パフォーマンス */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">予約回数</p>
                    <p className="text-lg font-bold text-white">{vehicle.totalBookings}回</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm">今月の収益</p>
                    <p className="text-lg font-bold text-green-400">¥{vehicle.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>

                {/* 料金情報 */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/60">1日: ¥{vehicle.price_day.toLocaleString()}</div>
                    <div className="text-white/60">1時間: ¥{vehicle.price_hour.toLocaleString()}</div>
                    <div className="text-white/60">距離: ¥{vehicle.price_per_km}/km</div>
                    <div className="text-white/60">デポジット: ¥{vehicle.deposit.toLocaleString()}</div>
                  </div>
                </div>

                {/* ステータス変更 */}
                <div className="mb-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">ステータス変更</label>
                  <select
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="available">利用可能</option>
                    <option value="rented">貸出中</option>
                    <option value="maintenance">メンテナンス</option>
                  </select>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Link
                    href={`/app/owner/vehicles/edit/${vehicle.id}`}
                    className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-center text-sm"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">車両削除の確認</h2>
            <p className="text-white/80 mb-6">
              「{selectedVehicle.title}」を削除しますか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVehicle(null);
                }}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}