import { useRouter } from 'next/router';
import { useState } from 'react';
import { PhotoUpload } from '../../../components/upload/PhotoUpload';
import { Footer } from '../../../components/layout/Footer';

export default function CheckinPage() {
  const router = useRouter();
  const { bookingId } = router.query as { bookingId: string };
  const [photos, setPhotos] = useState<{ checkin?: string; checkout?: string }>({});

  const handlePhotoUpload = (type: 'checkin' | 'checkout', url: string) => {
    setPhotos(prev => ({ ...prev, [type]: url }));
  };

  const completeCheckin = () => {
    if (!photos.checkin) {
      alert('チェックイン写真をアップロードしてください');
      return;
    }
    alert('チェックインが完了しました！');
    router.push('/app/bookings');
  };

  if (!bookingId) return <div>読み込み中...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">車両チェックイン</h1>
      <div className="max-w-md space-y-6">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-medium mb-4">受渡し前チェック</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              外観の確認（傷・汚れ）
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              内装の確認（清掃状態）
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              燃料/バッテリー残量
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              付属品確認（充電ケーブル等）
            </label>
          </div>
        </div>

        <PhotoUpload 
          bookingId={bookingId}
          type="checkin"
          onUpload={(url) => handlePhotoUpload('checkin', url)}
        />

        <button
          onClick={completeCheckin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          チェックイン完了
        </button>
</div>
      </div>
      <Footer />
    </div>
  );
}









