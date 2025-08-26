import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NavigationHeader } from '../../../../components/NavigationHeader';
import { Footer } from '../../../../components/layout/Footer';
import { PhotoUpload } from '../../../../components/upload/PhotoUpload';

interface VehicleFormData {
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
  description: string;
  location: string;
  pickup_points: string[];
  rules: string[];
  photos: string[];
}

export default function AddVehicle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 4,
    powertrain: 'gasoline',
    range_km: 0,
    price_day: 0,
    price_hour: 0,
    price_per_km: 0,
    deposit: 0,
    description: '',
    location: '',
    pickup_points: [''],
    rules: [''],
    photos: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('year') || name.includes('seats') || name.includes('range') || name.includes('deposit')
        ? Number(value)
        : value
    }));
  };

  const handlePickupPointChange = (index: number, value: string) => {
    const newPickupPoints = [...formData.pickup_points];
    newPickupPoints[index] = value;
    setFormData(prev => ({ ...prev, pickup_points: newPickupPoints }));
  };

  const addPickupPoint = () => {
    setFormData(prev => ({ ...prev, pickup_points: [...prev.pickup_points, ''] }));
  };

  const removePickupPoint = (index: number) => {
    if (formData.pickup_points.length > 1) {
      const newPickupPoints = formData.pickup_points.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, pickup_points: newPickupPoints }));
    }
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      const newRules = formData.rules.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, rules: newRules }));
    }
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 実際のAPI呼び出し
      console.log('車両登録データ:', formData);
      
      // 模擬的な遅延
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 成功時は車両管理ページにリダイレクト
      router.push('/app/owner/vehicles');
    } catch (error) {
      console.error('車両登録エラー:', error);
      alert('車両登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Head>
        <title>車両登録 | ShareNest</title>
        <meta name="description" content="新しい車両を登録してカーシェアリングを開始" />
      </Head>

      <NavigationHeader />

      <main className="container mx-auto px-4 py-12">
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
            車両登録
          </h1>
          <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            あなたの車両を登録してカーシェアリングを開始
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
        </div>

        {/* 戻るボタン */}
        <div className="mb-8">
          <Link href="/app/owner/dashboard" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 space-y-8">
            {/* 基本情報 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">車両タイトル *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 日産 SAKURA - 京都駅近く"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">ブランド *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 日産"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">モデル *</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: SAKURA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">年式 *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">座席数 *</label>
                  <select
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  >
                    <option value={2}>2人乗り</option>
                    <option value={4}>4人乗り</option>
                    <option value={5}>5人乗り</option>
                    <option value={7}>7人乗り</option>
                    <option value={8}>8人乗り</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">パワートレイン *</label>
                  <select
                    name="powertrain"
                    value={formData.powertrain}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  >
                    <option value="gasoline">ガソリン</option>
                    <option value="hybrid">ハイブリッド</option>
                    <option value="electric">電気自動車</option>
                    <option value="diesel">ディーゼル</option>
                  </select>
                </div>
              </div>
              
              {formData.powertrain === 'electric' && (
                <div className="mt-6">
                  <label className="block text-white/80 text-sm font-medium mb-2">航続距離 (km)</label>
                  <input
                    type="number"
                    name="range_km"
                    value={formData.range_km}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 180"
                  />
                </div>
              )}
            </div>

            {/* 料金設定 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">料金設定</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">1日料金 (円) *</label>
                  <input
                    type="number"
                    name="price_day"
                    value={formData.price_day}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 8000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">1時間料金 (円) *</label>
                  <input
                    type="number"
                    name="price_hour"
                    value={formData.price_hour}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 1000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">距離料金 (円/km) *</label>
                  <input
                    type="number"
                    name="price_per_km"
                    value={formData.price_per_km}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 20"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">デポジット (円) *</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 10000"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">詳細情報</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">車両説明 *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="車両の特徴、設備、注意事項などを詳しく記載してください"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">所在地 *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="例: 京都府京都市下京区"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 受け渡し場所 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">受け渡し場所</h2>
              <div className="space-y-4">
                {formData.pickup_points.map((point, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handlePickupPointChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder={`受け渡し場所 ${index + 1}`}
                      required
                    />
                    {formData.pickup_points.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePickupPoint(index)}
                        className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPickupPoint}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 border-dashed rounded-xl text-white/70 hover:bg-white/20 transition-colors"
                >
                  + 受け渡し場所を追加
                </button>
              </div>
            </div>

            {/* 利用ルール */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">利用ルール</h2>
              <div className="space-y-4">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder={`ルール ${index + 1}`}
                      required
                    />
                    {formData.rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRule}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 border-dashed rounded-xl text-white/70 hover:bg-white/20 transition-colors"
                >
                  + ルールを追加
                </button>
              </div>
            </div>

            {/* 写真アップロード */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">車両写真</h2>
              <PhotoUpload
                photos={formData.photos}
                onChange={handlePhotosChange}
                maxPhotos={10}
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-8">
              <Link
                href="/app/owner/dashboard"
                className="flex-1 px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-center"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登録中...' : '車両を登録'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}