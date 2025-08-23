import { useEffect, useState } from 'react';

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

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">予約履歴</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600">予約はありません。</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-lg border p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-medium">{b.vehicles?.title || '車両情報なし'}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(b.start_at).toLocaleDateString()} - {new Date(b.end_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">受渡し: {b.pickup_point}</p>
                  <p className="text-sm text-gray-600">走行距離: {b.distance_km}km</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {b.status === 'confirmed' ? '確定' :
                     b.status === 'completed' ? '完了' : b.status}
                  </span>
                  {b.charges?.amount && (
                    <p className="text-sm font-medium mt-1">¥{b.charges.amount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

