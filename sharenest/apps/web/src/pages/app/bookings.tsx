import { useEffect, useState } from 'react';
import { NavigationHeader } from '../../components/NavigationHeader';

type BookingRow = {
  id: string;
  start_at: string;
  end_at: string;
  pickup_point: string;
  status: string;
  distance_km: number;
  charges: any;
  vehicles?: { title: string; brand: string; model: string };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        if (json.bookings) setBookings(json.bookings as BookingRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="glass rounded-3xl p-12 text-center">
        <div className="text-4xl mb-4 animate-spin">⏳</div>
        <h2 className="text-2xl font-bold text-white">読み込み中...</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <NavigationHeader />
      
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <span className="gradient-text">予約履歴</span>
          </h1>
          <p className="text-white/70 text-xl">これまでのご予約をご確認いただけます</p>
        </div>
      </div>
      {bookings.length === 0 ? (
        <div className="text-center">
          <div className="glass rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🚗</div>
            <h2 className="text-3xl font-bold text-white mb-4">予約はありません</h2>
            <p className="text-white/70 text-lg mb-8">まだ予約がありません。新しい車両を探してみませんか？</p>
            <button 
              onClick={() => window.location.href = '/app/vehicles'}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              車両を探す
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {bookings.map((b) => (
            <div key={b.id} className="card-3d glass rounded-3xl p-8 hover:scale-105 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-3xl mr-4">
                  🚗
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{b.vehicles?.title || '車両情報なし'}</h2>
                  <p className="text-white/70">{b.vehicles?.brand} {b.vehicles?.model}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">期間:</span>
                  <span className="text-white font-medium">
                    {new Date(b.start_at).toLocaleDateString('ja-JP')} 〜 {new Date(b.end_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/60">受渡し場所:</span>
                  <span className="text-white font-medium">{b.pickup_point}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/60">走行距離:</span>
                  <span className="text-white font-medium">{b.distance_km}km</span>
                </div>
                
                {b.charges?.amount && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-white/60">合計金額:</span>
                    <span className="text-2xl font-black gradient-text">¥{b.charges.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  b.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white' :
                  b.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' :
                  'bg-gradient-to-r from-gray-500 to-gray-400 text-white'
                }`}>
                  {b.status === 'confirmed' ? '✅ 確定' :
                   b.status === 'completed' ? '✨ 完了' : b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

