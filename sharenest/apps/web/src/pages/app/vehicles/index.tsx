import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { NavigationHeader } from '../../../components/NavigationHeader';
import { Footer } from '../../../components/layout/Footer';

type VehicleRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  pickup_points: string[];
  title: string;
  price_day: number;
  price_hour: number;
  price_per_km: number;
  powertrain: string;
  range_km?: number;
  location: string;
  photos: string[];
  rating: number;
  reviews_count: number;
  features: string[];
  availability: boolean;
  owner_name: string;
};

type FilterState = {
  brand: string;
  seats: string;
  priceRange: string;
  powertrain: string;
  location: string;
  features: string[];
  sortBy: string;
};

const VehiclesPage: NextPage = () => {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    brand: '',
    seats: '',
    priceRange: '',
    powertrain: '',
    location: '',
    features: [],
    sortBy: 'price_asc'
  });

  // フェッチにタイムアウトを設けるヘルパー
  const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) => {
    const { timeout = 15000, ...rest } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const resp = await fetch(resource, { ...rest, signal: controller.signal });
      return resp;
    } finally {
      clearTimeout(id);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchWithTimeout('/api/vehicles', { timeout: 8000 });
        if (!response.ok) {
          throw new Error('車両データの取得に失敗しました');
        }
        
        const data = await response.json();
        
        // APIレスポンスをVehicleRow型に変換
        const vehiclesData: VehicleRow[] = data.map((vehicle: any) => ({
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          seats: vehicle.seats,
          pickup_points: vehicle.pickup_points || [],
          title: vehicle.title,
          price_day: vehicle.price_day,
          price_hour: vehicle.price_hour,
          price_per_km: vehicle.price_per_km || 0,
          powertrain: vehicle.powertrain,
          range_km: vehicle.range_km,
          location: vehicle.location || '未設定',
          photos: vehicle.photos || [],
          rating: vehicle.rating || 0,
          reviews_count: vehicle.reviews_count || 0,
          features: vehicle.features || [],
          availability: vehicle.availability !== undefined ? vehicle.availability : true,
          owner_name: vehicle.owner_name || 'オーナー'
        }));
        
        // コンポーネントがアンマウントされていない場合のみ状態を更新
        if (isMounted) {
          setVehicles(vehiclesData);
          setFilteredVehicles(vehiclesData);
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        if (isMounted) {
          if (err?.name === 'AbortError') {
            setError('サーバー応答がタイムアウトしました（8秒）');
          } else {
            setError('車両データの取得に失敗しました');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVehicles();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // フィルタリング機能
  useEffect(() => {
    let filtered = [...vehicles];

    // ブランドフィルター
    if (filters.brand) {
      filtered = filtered.filter(v => v.brand === filters.brand);
    }

    // 座席数フィルター
    if (filters.seats) {
      filtered = filtered.filter(v => v.seats.toString() === filters.seats);
    }

    // 価格帯フィルター
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'low':
          filtered = filtered.filter(v => v.price_day <= 8000);
          break;
        case 'mid':
          filtered = filtered.filter(v => v.price_day > 8000 && v.price_day <= 15000);
          break;
        case 'high':
          filtered = filtered.filter(v => v.price_day > 15000);
          break;
      }
    }

    // パワートレインフィルター
    if (filters.powertrain) {
      filtered = filtered.filter(v => v.powertrain === filters.powertrain);
    }

    // 地域フィルター
    if (filters.location) {
      filtered = filtered.filter(v => v.location.includes(filters.location));
    }

    // 機能フィルター
    if (filters.features.length > 0) {
      filtered = filtered.filter(v => 
        filters.features.every(feature => v.features.includes(feature))
      );
    }

    // 利用可能な車両のみ表示
    filtered = filtered.filter(v => v.availability);

    // ソート
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price_day - b.price_day);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price_day - a.price_day);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.year - a.year);
        break;
    }

    setFilteredVehicles(filtered);
  }, [vehicles, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFavorite = (vehicleId: string) => {
    setFavorites(prev => 
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      seats: '',
      priceRange: '',
      powertrain: '',
      location: '',
      features: [],
      sortBy: 'price_asc'
    });
  };

  const getUniqueValues = (key: keyof VehicleRow) => {
    return [...new Set(vehicles.map(v => v[key] as string).filter(Boolean))];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <h2 className="text-2xl font-bold text-white">読み込み中...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">エラーが発生しました</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <title>車両検索 | ShareNest</title>
        <meta name="description" content="関西エリアのカーシェアリング車両を検索・予約" />
      </Head>

      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>
      
      <NavigationHeader />
      
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out]">
              車両検索
            </h1>
            <p className="text-xl text-white/80 animate-[fadeInUp_1s_ease-out_0.2s_both]">関西エリアのカーシェアリング車両を検索・予約</p>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-8 animate-[fadeInUp_1s_ease-out_0.4s_both]"></div>
          </div>

          {/* 検索・フィルターセクション */}
          <div className="mb-8">
            <div className="glass rounded-3xl p-8">
              {/* 基本フィルター */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">ブランド</label>
                  <select 
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">すべて</option>
                    {getUniqueValues('brand').map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">座席数</label>
                  <select 
                    value={filters.seats}
                    onChange={(e) => handleFilterChange('seats', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">すべて</option>
                    <option value="4">4席</option>
                    <option value="5">5席</option>
                    <option value="7">7席</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">価格帯（1日）</label>
                  <select 
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">すべて</option>
                    <option value="low">〜¥8,000</option>
                    <option value="mid">¥8,000〜¥15,000</option>
                    <option value="high">¥15,000〜</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">パワートレイン</label>
                  <select 
                    value={filters.powertrain}
                    onChange={(e) => handleFilterChange('powertrain', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">すべて</option>
                    <option value="electric">電気自動車</option>
                    <option value="hybrid">ハイブリッド</option>
                    <option value="gasoline">ガソリン</option>
                  </select>
                </div>
              </div>

              {/* 地域・機能フィルター */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">地域</label>
                  <select 
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">すべて</option>
                    <option value="京都">京都</option>
                    <option value="大阪">大阪</option>
                    <option value="神戸">神戸</option>
                    <option value="奈良">奈良</option>
                    <option value="和歌山">和歌山</option>
                    <option value="滋賀">滋賀</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">並び順</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="price_asc">価格: 安い順</option>
                    <option value="price_desc">価格: 高い順</option>
                    <option value="rating">評価の高い順</option>
                    <option value="newest">年式の新しい順</option>
                  </select>
                </div>
              </div>

              {/* 機能チェックボックス */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">機能・設備</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['EV充電', 'カーナビ', 'ETC', 'バックカメラ', 'オートパイロット', 'ドライブレコーダー', 'ワイヤレス充電', 'プレミアムオーディオ'].map(feature => (
                    <label key={feature} className="flex items-center text-white/80 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={(e) => {
                          const newFeatures = e.target.checked
                            ? [...filters.features, feature]
                            : filters.features.filter(f => f !== feature);
                          handleFilterChange('features', newFeatures);
                        }}
                        className="mr-2 rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  フィルターをクリア
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    showMap 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {showMap ? '🗺️ マップを非表示' : '🗺️ マップで表示'}
                </button>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    📱 グリッド
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    📋 リスト
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 検索結果サマリー */}
          <div className="mb-6">
            <p className="text-white/80">
              {filteredVehicles.length}台の車両が見つかりました
              {vehicles.length !== filteredVehicles.length && ` (全${vehicles.length}台中)`}
            </p>
          </div>

          {/* マップ表示 */}
          {showMap && (
            <div className="glass rounded-3xl p-6 mb-8">
              <div className="h-64 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                <div className="text-center text-white/60">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>マップ機能（実装予定）</p>
                  <p className="text-sm mt-1">車両の位置をマップで確認できます</p>
                </div>
              </div>
            </div>
          )}

          {/* 車両一覧 */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="glass rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                  <div className="relative h-48">
                    <img
                      src={vehicle.photos[0] || '/api/placeholder/400/300'}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <button
                        onClick={() => toggleFavorite(vehicle.id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.includes(vehicle.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {favorites.includes(vehicle.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                        利用可能
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center text-white text-sm bg-black/50 px-2 py-1 rounded">
                        <span className="mr-1">⭐</span>
                        <span>{vehicle.rating}</span>
                        <span className="ml-1">({vehicle.reviews_count})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {vehicle.title}
                    </h3>
                    <p className="text-white/70 mb-1">
                      {vehicle.brand} {vehicle.model} ({vehicle.year}年)
                    </p>
                    <p className="text-white/60 text-sm mb-4">オーナー: {vehicle.owner_name}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-white/70">
                        <span className="mr-2">👥</span>
                        {vehicle.seats}席
                      </div>
                      <div className="flex items-center text-sm text-white/70">
                        <span className="mr-2">📍</span>
                        {vehicle.pickup_points?.[0] || '場所未設定'}
                      </div>
                      <div className="flex items-center text-sm text-white/70">
                        <span className="mr-2">{vehicle.powertrain === 'electric' ? '⚡' : vehicle.powertrain === 'hybrid' ? '🔋' : '⛽'}</span>
                        {vehicle.powertrain === 'electric' ? 'EV' : vehicle.powertrain === 'hybrid' ? 'ハイブリッド' : 'ガソリン'}
                        {vehicle.range_km && ` (${vehicle.range_km}km)`}
                      </div>
                    </div>

                    {/* 機能タグ */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {vehicle.features.slice(0, 3).map(feature => (
                        <span key={feature} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                          +{vehicle.features.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">
                          ¥{vehicle.price_day.toLocaleString()}
                        </span>
                        <span className="text-white/60 text-sm">/日</span>
                        <div className="text-white/60 text-xs">
                          ¥{vehicle.price_hour.toLocaleString()}/時間
                        </div>
                      </div>
                      <Link 
                        href={`/app/vehicles/${vehicle.id}`}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-medium group-hover:scale-105"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* リスト表示 */
            <div className="space-y-6">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="glass rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-64 h-48 lg:h-32">
                      <img
                        src={vehicle.photos[0] || '/api/placeholder/400/300'}
                        alt={vehicle.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{vehicle.title}</h3>
                          <p className="text-white/70">{vehicle.brand} {vehicle.model} ({vehicle.year}年)</p>
                          <p className="text-white/60 text-sm">オーナー: {vehicle.owner_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(vehicle.id)}
                            className={`p-2 rounded-full transition-colors ${
                              favorites.includes(vehicle.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {favorites.includes(vehicle.id) ? '❤️' : '🤍'}
                          </button>
                          <div className="flex items-center text-white text-sm bg-black/30 px-2 py-1 rounded">
                            <span className="mr-1">⭐</span>
                            <span>{vehicle.rating}</span>
                            <span className="ml-1">({vehicle.reviews_count})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="text-white/70">
                          <span className="mr-1">👥</span>
                          {vehicle.seats}席
                        </div>
                        <div className="text-white/70">
                          <span className="mr-1">{vehicle.powertrain === 'electric' ? '⚡' : vehicle.powertrain === 'hybrid' ? '🔋' : '⛽'}</span>
                          {vehicle.powertrain === 'electric' ? 'EV' : vehicle.powertrain === 'hybrid' ? 'ハイブリッド' : 'ガソリン'}
                        </div>
                        <div className="text-white/70">
                          <span className="mr-1">📍</span>
                          {vehicle.pickup_points?.[0]}
                        </div>
                        <div className="text-white/70">
                          <span className="mr-1">🛣️</span>
                          {vehicle.range_km}km
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {vehicle.features.map(feature => (
                          <span key={feature} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-white">
                            ¥{vehicle.price_day.toLocaleString()}
                          </span>
                          <span className="text-white/60 text-sm">/日</span>
                          <div className="text-white/60 text-sm">
                            ¥{vehicle.price_hour.toLocaleString()}/時間 • ¥{vehicle.price_per_km}/km
                          </div>
                        </div>
                        <Link 
                          href={`/app/vehicles/${vehicle.id}`}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-medium"
                        >
                          詳細を見る
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredVehicles.length === 0 && (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-6xl mb-6">🚗</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                条件に合う車両が見つかりませんでした
              </h3>
              <p className="text-white/70 mb-6">
                フィルター条件を変更して再度検索してください
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
              >
                フィルターをクリア
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VehiclesPage;


