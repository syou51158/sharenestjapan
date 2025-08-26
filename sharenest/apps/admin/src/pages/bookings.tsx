import Link from 'next/link';

export default function AdminBookingsPage() {
  // 実際はAPIから取得
  const bookings = [
    {
      id: '1',
      user: 'テスト太郎',
      vehicle: '日産 SAKURA',
      startDate: '2025-01-25',
      endDate: '2025-01-25',
      status: 'confirmed',
      amount: 6000,
    },
    {
      id: '2', 
      user: '田中花子',
      vehicle: 'Tesla Model 3',
      startDate: '2025-01-26',
      endDate: '2025-01-27',
      status: 'completed',
      amount: 45000,
    },
  ];

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
              <Link href="/bookings" className="glass px-4 py-2 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300">
                📅 予約管理
              </Link>
              <Link href="/vehicles" className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
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
            予約管理
          </h2>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            全ての予約を管理・確認
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* 予約カード */}
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="card-3d glass rounded-3xl p-6 hover:scale-105 transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{booking.vehicle}</h3>
                    <p className="text-white/80">{booking.user}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-white/60 text-sm mb-1">期間</p>
                    <p className="text-white font-semibold">{booking.startDate} - {booking.endDate}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">ステータス</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white' 
                        : booking.status === 'completed' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                        : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white'
                    }`}>
                      {booking.status === 'confirmed' ? '確定' :
                       booking.status === 'completed' ? '完了' : booking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">金額</p>
                    <p className="text-2xl font-bold gradient-text-blue">¥{booking.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="glass px-6 py-3 rounded-xl text-cyan-300 font-semibold hover:bg-white/20 transition-all duration-300">
                    詳細
                  </button>
                  <button className="glass px-6 py-3 rounded-xl text-red-400 font-semibold hover:bg-red-500/20 transition-all duration-300">
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空の状態 */}
        {bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center text-4xl">
              📅
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">予約がありません</h3>
            <p className="text-white/60 text-lg">新しい予約が入るとここに表示されます</p>
          </div>
        )}
      </main>
    </div>
  );
}





