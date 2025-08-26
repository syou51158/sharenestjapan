import Link from 'next/link';
import { useState, useEffect } from 'react';
import VehicleForm from '../components/VehicleForm';

interface Vehicle {
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
  created_at: string;
  updated_at: string;
  status?: 'available' | 'rented' | 'maintenance';
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // 車両データを取得
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('車両データの取得に失敗しました');
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 車両を削除
  const deleteVehicle = async (id: string) => {
    if (!confirm('この車両を削除しますか？')) return;
    
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('車両の削除に失敗しました');
      }
      
      await fetchVehicles(); // データを再取得
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'from-green-500 to-emerald-400';
      case 'rented':
        return 'from-blue-500 to-cyan-400';
      case 'maintenance':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '利用可能';
      case 'rented':
        return '貸出中';
      case 'maintenance':
        return 'メンテナンス';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* ヘッダー */}
      <div className="glass border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <h1 className="text-2xl font-black gradient-text-blue">ShareNest 管理</h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
                📊 ダッシュボード
              </Link>
              <Link href="/bookings" className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
                📅 予約管理
              </Link>
              <Link href="/vehicles" className="glass px-4 py-2 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300">
                🚗 車両管理
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            車両管理
          </h2>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            全ての車両を管理・確認
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
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

        {/* 車両追加ボタン */}
        <div className="mb-8 text-center">
          <button 
            onClick={() => setShowAddForm(true)}
            className="glass px-8 py-4 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300"
          >
            + 新しい車両を追加
          </button>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-white/60 text-lg">車両データを読み込み中...</p>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={fetchVehicles}
              className="mt-4 glass px-6 py-3 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300"
            >
              再試行
            </button>
          </div>
        )}

        {/* 車両カード */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="card-3d glass rounded-3xl p-6 hover:scale-105 transition-all duration-500">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">
                    {vehicle.photos && vehicle.photos.length > 0 ? (
                      <img src={vehicle.photos[0]} alt={vehicle.title} className="w-16 h-16 mx-auto rounded-lg object-cover" />
                    ) : (
                      '🚗'
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{vehicle.title}</h3>
                  <p className="text-white/60">{vehicle.brand} {vehicle.model} ({vehicle.year}年)</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">パワートレイン</span>
                    <span className="text-white font-semibold">{vehicle.powertrain}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">座席数</span>
                    <span className="text-white font-semibold">{vehicle.seats}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">日額料金</span>
                    <span className="text-2xl font-bold gradient-text-blue">¥{vehicle.price_day.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">時間料金</span>
                    <span className="text-white font-semibold">¥{vehicle.price_hour.toLocaleString()}/時間</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">ピックアップ地点</span>
                    <span className="text-white font-semibold">{vehicle.pickup_points[0] || 'なし'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setEditingVehicle(vehicle)}
                    className="glass px-4 py-3 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    編集
                  </button>
                  <button 
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="glass px-4 py-3 rounded-xl text-red-400 font-semibold hover:bg-red-500/20 transition-all duration-300"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空の状態 */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center text-4xl">
              🚗
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">車両がありません</h3>
            <p className="text-white/60 text-lg">新しい車両を追加してください</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-6 glass px-8 py-4 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300"
            >
              車両を追加する
            </button>
          </div>
        )}

        {/* 車両追加・編集フォーム */}
        {(showAddForm || editingVehicle) && (
          <VehicleForm 
            vehicle={editingVehicle}
            onClose={() => {
              setShowAddForm(false);
              setEditingVehicle(null);
            }}
            onSave={() => {
              fetchVehicles();
              setShowAddForm(false);
              setEditingVehicle(null);
            }}
          />
        )}
      </main>
    </div>
  );
}