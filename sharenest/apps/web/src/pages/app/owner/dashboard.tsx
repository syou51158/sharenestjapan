import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { NavigationHeader } from '../../../components/NavigationHeader';

interface OwnerStats {
  totalVehicles: number;
  activeBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface RecentBooking {
  id: string;
  vehicleTitle: string;
  renterName: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Vehicle {
  id: string;
  title: string;
  status: 'available' | 'rented' | 'maintenance';
  totalBookings: number;
  monthlyRevenue: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<OwnerStats>({
    totalVehicles: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 実際のAPIから取得
    const mockStats: OwnerStats = {
      totalVehicles: 3,
      activeBookings: 2,
      monthlyRevenue: 85000,
      totalRevenue: 450000
    };

    const mockBookings: RecentBooking[] = [
      {
        id: '1',
        vehicleTitle: '日産 SAKURA',
        renterName: 'テスト太郎',
        startDate: '2025-01-25',
        endDate: '2025-01-25',
        amount: 6000,
        status: 'confirmed'
      },
      {
        id: '2',
        vehicleTitle: 'Tesla Model 3',
        renterName: '田中花子',
        startDate: '2025-01-26',
        endDate: '2025-01-27',
        amount: 45000,
        status: 'pending'
      }
    ];

    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        title: '日産 SAKURA',
        status: 'rented',
        totalBookings: 15,
        monthlyRevenue: 35000
      },
      {
        id: '2',
        title: 'Tesla Model 3',
        status: 'available',
        totalBookings: 8,
        monthlyRevenue: 50000
      },
      {
        id: '3',
        title: 'Mercedes EQS',
        status: 'maintenance',
        totalBookings: 0,
        monthlyRevenue: 0
      }
    ];

    setStats(mockStats);
    setRecentBookings(mockBookings);
    setVehicles(mockVehicles);
    setLoading(false);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '利用可能';
      case 'rented': return '貸出中';
      case 'maintenance': return 'メンテナンス';
      case 'pending': return '承認待ち';
      case 'confirmed': return '確定';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'rented': return 'text-blue-400';
      case 'maintenance': return 'text-orange-400';
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Head>
          <title>オーナーダッシュボード | ShareNest</title>
        </Head>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-white/80">ダッシュボードを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head>
        <title>オーナーダッシュボード | ShareNest</title>
        <meta name="description" content="車両オーナー向けダッシュボード - 収益管理、車両管理、予約状況を確認" />
      </Head>

      <NavigationHeader />

      <main className="container mx-auto px-4 py-12">
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            オーナーダッシュボード
          </h1>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            あなたの車両の収益と予約状況を管理
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🚗</div>
            <h3 className="text-lg font-bold text-white mb-1">登録車両数</h3>
            <p className="text-3xl font-black gradient-text-blue">{stats.totalVehicles}</p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="text-lg font-bold text-white mb-1">アクティブ予約</h3>
            <p className="text-3xl font-black gradient-text-green">{stats.activeBookings}</p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-bold text-white mb-1">今月の収益</h3>
            <p className="text-3xl font-black gradient-text-blue">¥{stats.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-bold text-white mb-1">総収益</h3>
            <p className="text-3xl font-black gradient-text-green">¥{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/app/owner/vehicles/add" className="card-3d glass rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">➕</div>
            <h3 className="text-xl font-bold text-white mb-2">新しい車両を登録</h3>
            <p className="text-white/70">車両情報を入力して収益を開始</p>
          </Link>
          <Link href="/app/owner/vehicles" className="card-3d glass rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🚙</div>
            <h3 className="text-xl font-bold text-white mb-2">車両管理</h3>
            <p className="text-white/70">登録済み車両の編集・管理</p>
          </Link>
          <Link href="/app/owner/bookings" className="card-3d glass rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">予約管理</h3>
            <p className="text-white/70">予約の承認・拒否・確認</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の予約 */}
          <div className="glass rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">最近の予約</h2>
              <Link href="/app/owner/bookings" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                すべて見る →
              </Link>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="glass-dark rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{booking.vehicleTitle}</h3>
                      <p className="text-white/70 text-sm">{booking.renterName}</p>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>{booking.startDate} - {booking.endDate}</span>
                    <span className="font-semibold text-green-400">¥{booking.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 車両パフォーマンス */}
          <div className="glass rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">車両パフォーマンス</h2>
              <Link href="/app/owner/vehicles" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                詳細を見る →
              </Link>
            </div>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="glass-dark rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{vehicle.title}</h3>
                      <p className="text-white/70 text-sm">予約回数: {vehicle.totalBookings}回</p>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">今月の収益</span>
                    <span className="font-semibold text-green-400">¥{vehicle.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}