import { useState, useEffect } from 'react';

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
}

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
}

export default function VehicleForm({ vehicle, onClose, onSave }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 4,
    powertrain: 'ガソリン',
    range_km: 0,
    price_day: 0,
    price_hour: 0,
    price_per_km: 0,
    deposit: 0,
    pickup_points: ['京都駅'],
    photos: [] as string[],
    rules: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モードの場合、既存データを設定
  useEffect(() => {
    if (vehicle) {
      setFormData({
        title: vehicle.title,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        seats: vehicle.seats,
        powertrain: vehicle.powertrain,
        range_km: vehicle.range_km,
        price_day: vehicle.price_day,
        price_hour: vehicle.price_hour,
        price_per_km: vehicle.price_per_km,
        deposit: vehicle.deposit,
        pickup_points: vehicle.pickup_points,
        photos: vehicle.photos,
        rules: vehicle.rules
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = vehicle ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
      const method = vehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPickupPoint = () => {
    setFormData(prev => ({
      ...prev,
      pickup_points: [...prev.pickup_points, '']
    }));
  };

  const removePickupPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pickup_points: prev.pickup_points.filter((_, i) => i !== index)
    }));
  };

  const updatePickupPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pickup_points: prev.pickup_points.map((point, i) => i === index ? value : point)
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold gradient-text">
            {vehicle ? '車両を編集' : '新しい車両を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">基本情報</h3>
              
              <div>
                <label className="block text-white/80 mb-2">タイトル *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 日産 SAKURA"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">ブランド *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                    placeholder="例: 日産"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">モデル *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                    placeholder="例: SAKURA"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">年式 *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">座席数 *</label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                    min="1"
                    max="8"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">パワートレイン *</label>
                <select
                  value={formData.powertrain}
                  onChange={(e) => handleInputChange('powertrain', e.target.value)}
                  className="w-full glass rounded-xl px-4 py-3 text-white"
                  required
                >
                  <option value="ガソリン">ガソリン</option>
                  <option value="ハイブリッド">ハイブリッド</option>
                  <option value="EV">EV</option>
                  <option value="ディーゼル">ディーゼル</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">航続距離 (km)</label>
                <input
                  type="number"
                  value={formData.range_km}
                  onChange={(e) => handleInputChange('range_km', parseInt(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 180"
                  min="0"
                />
              </div>
            </div>

            {/* 料金情報 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">料金情報</h3>
              
              <div>
                <label className="block text-white/80 mb-2">日額料金 (円) *</label>
                <input
                  type="number"
                  value={formData.price_day}
                  onChange={(e) => handleInputChange('price_day', parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 6000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">時間料金 (円) *</label>
                <input
                  type="number"
                  value={formData.price_hour}
                  onChange={(e) => handleInputChange('price_hour', parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 800"
                  min="0"
                  step="50"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">距離料金 (円/km)</label>
                <input
                  type="number"
                  value={formData.price_per_km}
                  onChange={(e) => handleInputChange('price_per_km', parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 20"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">デポジット (円)</label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', parseFloat(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="例: 10000"
                  min="0"
                  step="1000"
                />
              </div>

              {/* ピックアップ地点 */}
              <div>
                <label className="block text-white/80 mb-2">ピックアップ地点</label>
                <div className="space-y-2">
                  {formData.pickup_points.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => updatePickupPoint(index, e.target.value)}
                        className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                        placeholder="例: 京都駅"
                      />
                      {formData.pickup_points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePickupPoint(index)}
                          className="glass px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/20"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPickupPoint}
                    className="glass px-4 py-2 rounded-xl text-cyan-300 hover:bg-white/20"
                  >
                    + 地点を追加
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ルール */}
          <div>
            <label className="block text-white/80 mb-2">利用ルール</label>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-white/50"
                    placeholder="例: 禁煙車両です"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="glass px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/20"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRule}
                className="glass px-4 py-2 rounded-xl text-cyan-300 hover:bg-white/20"
              >
                + ルールを追加
              </button>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass px-6 py-4 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-300"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '保存中...' : (vehicle ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}