import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { NavigationHeader } from '../../../components/NavigationHeader';
import { Footer } from '../../../components/layout/Footer';

interface Booking {
  id: string;
  vehicle_id: string;
  vehicle_title: string;
  vehicle_brand: string;
  vehicle_model: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  pickup_location: string;
  total_amount: number;
  deposit_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  notes?: string;
}

export default function OwnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // TODO: 実際のAPIから取得
    const mockBookings: Booking[] = [
      {
        id: '1',
        vehicle_id: '1',
        vehicle_title: '日産 SAKURA - 京都駅近く',
        vehicle_brand: '日産',
        vehicle_model: 'SAKURA',
        renter_name: '田中太郎',
        renter_email: 'tanaka@example.com',
        renter_phone: '090-1234-5678',
        start_date: '2025-01-25',
        end_date: '2025-01-26',
        start_time: '10:00',
        end_time: '18:00',
        pickup_location: '京都駅八条口',
        total_amount: 16000,
        deposit_amount: 10000,
        status: 'pending',
        payment_status: 'pending',
        created_at: '2025-01-20T10:30:00Z',
        notes: '観光で使用予定です。よろしくお願いします。'
      },
      {
        id: '2',
        vehicle_id: '2',
        vehicle_title: 'Tesla Model 3 - 大阪梅田',
        vehicle_brand: 'Tesla',
        vehicle_model: 'Model 3',
        renter_name: '佐藤花子',
        renter_email: 'sato@example.com',
        renter_phone: '080-9876-5432',
        start_date: '2025-01-22',
        end_date: '2025-01-22',
        start_time: '14:00',
        end_time: '20:00',
        pickup_location: '梅田駅',
        total_amount: 12000,
        deposit_amount: 20000,
        status: 'active',
        payment_status: 'paid',
        created_at: '2025-01-18T15:45:00Z'
      },
      {
        id: '3',
        vehicle_id: '1',
        vehicle_title: '日産 SAKURA - 京都駅近く',
        vehicle_brand: '日産',
        vehicle_model: 'SAKURA',
        renter_name: '山田次郎',
        renter_email: 'yamada@example.com',
        renter_phone: '070-1111-2222',
        start_date: '2025-01-15',
        end_date: '2025-01-16',
        start_time: '09:00',
        end_time: '17:00',
        pickup_location: 'イオンモール京都',
        total_amount: 16000,
        deposit_amount: 10000,
        status: 'completed',
        payment_status: 'paid',
        created_at: '2025-01-10T12:00:00Z'
      },
      {
        id: '4',
        vehicle_id: '2',
        vehicle_title: 'Tesla Model 3 - 大阪梅田',
        vehicle_brand: 'Tesla',
        vehicle_model: 'Model 3',
        renter_name: '鈴木一郎',
        renter_email: 'suzuki@example.com',
        renter_phone: '090-3333-4444',
        start_date: '2025-01-28',
        end_date: '2025-01-29',
        start_time: '08:00',
        end_time: '19:00',
        pickup_location: 'グランフロント大阪',
        total_amount: 30000,
        deposit_amount: 20000,
        status: 'confirmed',
        payment_status: 'paid',
        created_at: '2025-01-19T09:15:00Z',
        notes: 'ビジネス利用です。'
      }
    ];

    setBookings(mockBookings);
    setLoading(false);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち';
      case 'confirmed': return '確定';
      case 'active': return '利用中';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'confirmed': return 'text-blue-400 bg-blue-400/20';
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '未払い';
      case 'paid': return '支払済み';
      case 'refunded': return '返金済み';
      default: return status;
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      // TODO: 実際のAPI呼び出し
      console.log(`予約 ${bookingId} を ${action}`);
      
      const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ));
    } catch (error) {
      console.error('予約操作エラー:', error);
      alert('操作に失敗しました。');
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Head>
          <title>予約管理 | ShareNest</title>
        </Head>
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-white/80">予約情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head>
        <title>予約管理 | ShareNest</title>
        <meta name="description" content="車両の予約状況管理・承認・拒否" />
      </Head>

      <NavigationHeader />

      <main className="container mx-auto px-4 py-12">
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            予約管理
          </h1>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            車両の予約状況管理・承認・拒否
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/app/owner/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← ダッシュボードに戻る
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-bold text-white mb-1">総予約数</h3>
            <p className="text-3xl font-black gradient-text-blue">{bookings.length}</p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <h3 className="text-lg font-bold text-white mb-1">承認待ち</h3>
            <p className="text-3xl font-black gradient-text-yellow">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-bold text-white mb-1">確定済み</h3>
            <p className="text-3xl font-black gradient-text-blue">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🚗</div>
            <h3 className="text-lg font-bold text-white mb-1">利用中</h3>
            <p className="text-3xl font-black gradient-text-green">
              {bookings.filter(b => b.status === 'active').length}
            </p>
          </div>
          <div className="card-3d glass rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-bold text-white mb-1">今月の収益</h3>
            <p className="text-3xl font-black gradient-text-green">
              ¥{bookings.filter(b => b.status === 'completed' && b.payment_status === 'paid')
                .reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="glass rounded-3xl p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              すべて ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              承認待ち ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              確定済み ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              利用中 ({bookings.filter(b => b.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-gray-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              完了 ({bookings.filter(b => b.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* 予約一覧 */}
        {filteredBookings.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-2xl font-bold text-white mb-4">予約がありません</h2>
            <p className="text-white/70">
              {filterStatus === 'all' 
                ? 'まだ予約が入っていません。車両を登録して予約を受け付けましょう。'
                : `${getStatusText(filterStatus)}の予約はありません。`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="glass rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* 予約情報 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-white">{booking.vehicle_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.payment_status === 'paid' 
                          ? 'text-green-400 bg-green-400/20'
                          : 'text-yellow-400 bg-yellow-400/20'
                      }`}>
                        {getPaymentStatusText(booking.payment_status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-white/60">利用者</p>
                        <p className="text-white font-medium">{booking.renter_name}</p>
                        <p className="text-white/70">{booking.renter_email}</p>
                      </div>
                      <div>
                        <p className="text-white/60">利用期間</p>
                        <p className="text-white font-medium">
                          {formatDate(booking.start_date)} {booking.start_time} 〜
                        </p>
                        <p className="text-white font-medium">
                          {formatDate(booking.end_date)} {booking.end_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">受け渡し場所</p>
                        <p className="text-white font-medium">{booking.pickup_location}</p>
                      </div>
                      <div>
                        <p className="text-white/60">料金</p>
                        <p className="text-white font-medium">¥{booking.total_amount.toLocaleString()}</p>
                        <p className="text-white/70">デポジット: ¥{booking.deposit_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-white/60">申込日時</p>
                        <p className="text-white font-medium">{formatDateTime(booking.created_at)}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">備考</p>
                        <p className="text-white text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      詳細を見る
                    </button>
                    
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'approve')}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        >
                          承認する
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          拒否する
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleBookingAction(booking.id, 'reject')}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* 詳細モーダル */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">予約詳細</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBooking(null);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">車両情報</h3>
                <p className="text-white">{selectedBooking.vehicle_title}</p>
                <p className="text-white/70">{selectedBooking.vehicle_brand} {selectedBooking.vehicle_model}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">利用者情報</h3>
                <div className="space-y-2">
                  <p className="text-white">氏名: {selectedBooking.renter_name}</p>
                  <p className="text-white">メール: {selectedBooking.renter_email}</p>
                  <p className="text-white">電話: {selectedBooking.renter_phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">利用詳細</h3>
                <div className="space-y-2">
                  <p className="text-white">開始: {formatDate(selectedBooking.start_date)} {selectedBooking.start_time}</p>
                  <p className="text-white">終了: {formatDate(selectedBooking.end_date)} {selectedBooking.end_time}</p>
                  <p className="text-white">受け渡し場所: {selectedBooking.pickup_location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">料金情報</h3>
                <div className="space-y-2">
                  <p className="text-white">利用料金: ¥{selectedBooking.total_amount.toLocaleString()}</p>
                  <p className="text-white">デポジット: ¥{selectedBooking.deposit_amount.toLocaleString()}</p>
                  <p className="text-white">支払い状況: {getPaymentStatusText(selectedBooking.payment_status)}</p>
                </div>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">備考</h3>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}