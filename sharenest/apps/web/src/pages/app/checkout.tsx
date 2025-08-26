import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { calculatePrice } from '../../lib/pricing';
import { getSbSchema } from '../../lib/supabase';
import { NavigationHeader } from '../../components/NavigationHeader';
import { useAuth } from '../../components/auth/AuthProvider';

interface Vehicle {
  id: string;
  // Display fields (legacy naming used in this page)
  make: string;
  model: string;
  year: number;
  seat_count: number;
  fuel_type: string;
  daily_rate: number;
  address: string[];
  description: string;
  // Pricing/lib compatibility fields
  title: string;
  brand: string;
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
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

type Step = 'details' | 'payment' | 'confirmation';

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const { vehicleId } = router.query as { vehicleId?: string };
  const { user, loading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [hours, setHours] = useState(24);
  const [distanceKm, setDistanceKm] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証チェック
    if (!authLoading && !user) {
      router.push('/app/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }
    
    if (vehicleId && user) {
      fetchVehicle();
    }
  }, [vehicleId, user, authLoading, router]);

  const fetchVehicle = async () => {
    try {
      console.log('Fetching vehicle with ID:', vehicleId);
      
      // APIルートを使用して車両データを取得
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicle');
      }
      
      const data = await response.json();
      console.log('Vehicle data:', data);
      
      // データベース構造に合わせて変換（必要なフィールドをすべて保持）
      setVehicle({
        id: data.id,
        // display fields
        make: data.brand,
        model: data.model,
        year: data.year,
        seat_count: data.seats,
        fuel_type: data.powertrain,
        daily_rate: data.price_day,
        address: data.pickup_points || [],
        description: data.title || `${data.brand} ${data.model}`,
        // pricing fields
        title: data.title,
        brand: data.brand,
        seats: data.seats,
        powertrain: data.powertrain,
        range_km: data.range_km || 0,
        price_day: data.price_day || 0,
        price_hour: data.price_hour || 0,
        price_per_km: data.price_per_km || 0,
        deposit: data.deposit || 0,
        pickup_points: data.pickup_points || [],
        photos: Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : []),
        rules: data.rules || [],
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white/70">車両情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🚗</div>
          <h2 className="text-3xl font-bold text-white mb-4">{error}</h2>
          <p className="text-white/70 mb-8">車両情報を取得できませんでした。</p>
          <button 
            onClick={() => router.push('/app/vehicles')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
          >
            車両一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const price = calculatePrice(vehicle, hours, distanceKm);

  // ステップ表示コンポーネント
  const StepIndicator = () => {
    const steps = [
      { id: 'details', label: '詳細入力', icon: '📋' },
      { id: 'payment', label: 'お支払い', icon: '💳' },
      { id: 'confirmation', label: '確認完了', icon: '✅' }
    ];

    return (
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 ${
              currentStep === step.id ? 'bg-gradient-to-r from-blue-600 to-cyan-500 scale-110' :
              steps.findIndex(s => s.id === currentStep) > index ? 'bg-gradient-to-r from-green-500 to-blue-500' :
              'bg-white/20'
            }`}>
              <span className="text-2xl">{step.icon}</span>
              {steps.findIndex(s => s.id === currentStep) > index && (
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              )}
            </div>
            <div className="ml-3 mr-8">
              <p className={`text-sm font-medium ${
                currentStep === step.id ? 'text-cyan-300' : 'text-white/60'
              }`}>
                ステップ {index + 1}
              </p>
              <p className={`text-lg font-bold ${
                currentStep === step.id ? 'text-white' : 'text-white/40'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 mx-4 rounded-full transition-all duration-500 ${
                steps.findIndex(s => s.id === currentStep) > index ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-white/20'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 詳細入力ステップ
  const DetailsStep = () => (
    <div className="space-y-8 animate-[fadeInUp_0.8s_ease-out]">
      <div className="card-3d glass rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">予約詳細を入力</h2>
        
        {/* 車両情報表示 */}
        <div className="neomorphism rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-4xl">
              🚗
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{vehicle.make} {vehicle.model}</h3>
              <p className="text-gray-600">{vehicle.make} {vehicle.model}</p>
              <p className="text-sm text-gray-500">{vehicle.seat_count}名乗り</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-white mb-3">利用時間</label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-white/60 text-sm mt-2">
                  <span>1時間</span>
                  <span>1週間</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-4xl font-black gradient-text">{hours}</span>
                <span className="text-white/80 text-xl ml-2">時間</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-white mb-3">想定走行距離</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-white/60 text-sm mt-2">
                  <span>0km</span>
                  <span>500km</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-4xl font-black gradient-text">{distanceKm}</span>
                <span className="text-white/80 text-xl ml-2">km</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 料金表示 */}
            <div className="glass rounded-2xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">料金内訳</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">基本料金 ({hours}時間)</span>
                  <span className="text-white font-medium">¥{price.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">距離料金 ({distanceKm}km)</span>
                  <span className="text-white font-medium">¥{price.distance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">保険料</span>
                  <span className="text-white font-medium">¥{price.insurance.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">合計金額</span>
                    <span className="gradient-text">¥{price.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentStep('payment')}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold rounded-2xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/50"
          >
            お支払いへ進む
          </button>
        </div>
      </div>
    </div>
  );

  // 支払いステップ
  const PaymentStep = () => (
    <div className="space-y-8 animate-[fadeInUp_0.8s_ease-out]">
      <div className="card-3d glass rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">お支払い情報</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Elements stripe={stripePromise}>
              <CheckoutForm vehicleId={vehicleId!} hours={hours} distanceKm={distanceKm} />
            </Elements>
          </div>
          
          <div className="space-y-6">
            {/* 予約サマリー */}
            <div className="neomorphism rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">予約サマリー</h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>車両:</span>
                  <span className="font-medium">{vehicle.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>利用時間:</span>
                  <span className="font-medium">{hours}時間</span>
                </div>
                <div className="flex justify-between">
                  <span>走行距離:</span>
                  <span className="font-medium">{distanceKm}km</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>合計:</span>
                    <span className="gradient-text">¥{price.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('details')}
              className="w-full px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              ← 詳細に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <NavigationHeader showBack backUrl="/app/vehicles" title="予約・お支払い" />
      
      {/* ヘッダー */}
      <div className="relative pt-36 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30"></div>
        <div className="container mx-auto relative z-10">
          <StepIndicator />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 pb-24">
        {currentStep === 'details' && <DetailsStep />}
        {currentStep === 'payment' && <PaymentStep />}
      </div>
    </div>
  );
};

function CheckoutForm({ vehicleId, hours, distanceKm }: { vehicleId: string; hours: number; distanceKm: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, hours, distanceKm }),
      });
      const json = await res.json();
      if (json.clientSecret) {
        setClientSecret(json.clientSecret);
        setPaymentIntentId(json.clientSecret.split('_secret_')[0]);
        setAmount(json.amount);
      }
    })();
  }, [vehicleId, hours, distanceKm]);

  const onPay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setSubmitting(true);
    
    let error: any = null;
    let paymentIntent: { id: string; status: string } | null = null;
    const isMock = clientSecret.includes('_mock');
    if (isMock) {
      // Stripe未設定時は即時成功扱い
      paymentIntent = { id: clientSecret.split('_secret_')[0], status: 'succeeded' };
    } else {
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: window.location.origin + '/app/bookings' },
        redirect: 'if_required',
      });
      error = (result as any).error;
      paymentIntent = (result as any).paymentIntent;
    }
    
    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // 予約確定API呼び出し
      try {
        // 認証トークンを取得
        const { data: { session } } = await getSbSchema().auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          alert('認証エラーが発生しました。再度ログインしてください。');
          router.push('/app/login');
          return;
        }
        
        const res = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vehicleId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
            totalPrice: amount,
            userDetails: {
              paymentIntentId: paymentIntent.id,
              hours,
              distanceKm
            }
          }),
        });
        
        if (res.ok) {
          alert('予約が確定しました！');
          router.push('/app/bookings');
        } else {
          const errorData = await res.json();
          alert(`予約の保存に失敗しました: ${errorData.error}`);
        }
      } catch (e) {
        console.error('Booking confirmation error:', e);
        alert('予約確定でエラーが発生しました');
      }
    }
    setSubmitting(false);
  };

return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h4 className="text-xl font-bold text-white mb-4">支払い方法</h4>
        {clientSecret && <PaymentElement />}
      </div>
      
      <button 
        disabled={!clientSecret || submitting} 
        onClick={onPay} 
        className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xl font-bold rounded-2xl disabled:opacity-50 hover:from-blue-600 hover:to-green-600 transition-all duration-500 transform hover:scale-105 shadow-2xl"
      >
        {submitting ? '処理中...' : `¥${amount?.toLocaleString()} で予約確定`}
      </button>
    </div>
  );
}

export default CheckoutPage;
