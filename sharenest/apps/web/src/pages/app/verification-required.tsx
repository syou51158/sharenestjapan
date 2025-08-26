import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { NavigationHeader } from '../../components/NavigationHeader';
import { Footer } from '../../components/layout/Footer';

const VerificationRequiredPage: NextPage = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'info' | 'upload' | 'submitted'>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitVerification = async () => {
    setIsSubmitting(true);
    try {
      // TODO: 実際の本人確認処理を実装
      // ここでは仮の処理として、プロフィールを更新
      await updateUserProfile({
        phone: formData.phoneNumber,
        kyc_status: 'pending'
      });
      
      setVerificationStep('submitted');
    } catch (error) {
      console.error('Verification submission error:', error);
      alert('本人確認の申請中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <title>本人確認が必要です | ShareNest</title>
        <meta name="description" content="サービスを利用するには本人確認が必要です" />
      </Head>

      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite]"></div>
      </div>
      
      <NavigationHeader />
      
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-8 animate-[fadeInUp_1s_ease-out]">
                🔐
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black gradient-text mb-6 animate-[fadeInUp_1s_ease-out_0.2s_both]">
                本人確認が必要です
              </h1>
              
              <p className="text-xl text-white/80 mb-8 animate-[fadeInUp_1s_ease-out_0.4s_both]">
                安全なサービス提供のため、本人確認を完了してください。
              </p>
            </div>

            {/* 進行状況 */}
            <div className="glass rounded-3xl p-8 mb-8">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    verificationStep === 'info' ? 'bg-cyan-500 text-white' : 
                    verificationStep === 'upload' || verificationStep === 'submitted' ? 'bg-green-500 text-white' : 
                    'bg-white/20 text-white/60'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-16 ${
                    verificationStep === 'upload' || verificationStep === 'submitted' ? 'bg-green-500' : 'bg-white/20'
                  }`}></div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    verificationStep === 'upload' ? 'bg-cyan-500 text-white' : 
                    verificationStep === 'submitted' ? 'bg-green-500 text-white' : 
                    'bg-white/20 text-white/60'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 w-16 ${
                    verificationStep === 'submitted' ? 'bg-green-500' : 'bg-white/20'
                  }`}></div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    verificationStep === 'submitted' ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                  }`}>
                    3
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {verificationStep === 'info' && '基本情報の入力'}
                  {verificationStep === 'upload' && '書類のアップロード'}
                  {verificationStep === 'submitted' && '申請完了'}
                </h3>
                <p className="text-white/70">
                  {verificationStep === 'info' && '運転免許証などの基本情報を入力してください'}
                  {verificationStep === 'upload' && '運転免許証の写真をアップロードしてください'}
                  {verificationStep === 'submitted' && '本人確認の申請が完了しました'}
                </p>
              </div>
            </div>

            {/* ステップ1: 基本情報入力 */}
            {verificationStep === 'info' && (
              <div className="glass rounded-3xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">基本情報</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">氏名（フルネーム）</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="山田太郎"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">電話番号</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="090-1234-5678"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">住所</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="京都府京都市下京区烏丸通七条下ル"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">運転免許証番号</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="123456789012"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">免許有効期限</label>
                    <input
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setVerificationStep('upload')}
                    disabled={!formData.fullName || !formData.phoneNumber || !formData.licenseNumber}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ進む
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 書類アップロード */}
            {verificationStep === 'upload' && (
              <div className="glass rounded-3xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">運転免許証のアップロード</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">表面</h4>
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-white/70 mb-2">クリックして画像をアップロード</p>
                      <p className="text-white/50 text-sm">JPG, PNG形式（最大5MB）</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">裏面</h4>
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-white/70 mb-2">クリックして画像をアップロード</p>
                      <p className="text-white/50 text-sm">JPG, PNG形式（最大5MB）</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 text-xl">⚠️</div>
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2">撮影時の注意事項</h4>
                      <ul className="text-yellow-400/80 text-sm space-y-1">
                        <li>• 免許証全体が鮮明に写るように撮影してください</li>
                        <li>• 光の反射で文字が読めない部分がないか確認してください</li>
                        <li>• 個人情報保護のため、安全な環境で撮影してください</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setVerificationStep('info')}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleSubmitVerification}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl hover:from-green-600 hover:to-emerald-500 transition-all duration-300 font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? '申請中...' : '本人確認を申請'}
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: 申請完了 */}
            {verificationStep === 'submitted' && (
              <div className="glass rounded-3xl p-8 mb-8 text-center">
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-3xl font-bold text-white mb-4">申請完了</h3>
                <p className="text-white/70 mb-8">
                  本人確認の申請が完了しました。<br />
                  審査には通常1〜3営業日かかります。結果はメールでお知らせいたします。
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                  <h4 className="text-blue-400 font-medium mb-2">審査中にできること</h4>
                  <ul className="text-blue-400/80 text-sm space-y-1">
                    <li>• 車両の検索・閲覧</li>
                    <li>• プロフィールの編集</li>
                    <li>• サービスの詳細確認</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/app/vehicles"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-medium"
                  >
                    車両を探す
                  </Link>
                  
                  <Link
                    href="/app/profile"
                    className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    プロフィール設定
                  </Link>
                </div>
              </div>
            )}

            {/* 現在のステータス表示 */}
            {userProfile && (
              <div className="glass rounded-3xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">現在のステータス</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">
                      {userProfile.is_verified ? '✅' : '⏳'}
                    </div>
                    <div className="text-white/70 text-sm mb-1">本人確認</div>
                    <div className="text-white font-medium">
                      {userProfile.is_verified ? '確認済み' : '未確認'}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">
                      {userProfile.kyc_status === 'approved' ? '✅' : 
                       userProfile.kyc_status === 'pending' ? '⏳' : '❌'}
                    </div>
                    <div className="text-white/70 text-sm mb-1">KYC審査</div>
                    <div className="text-white font-medium">
                      {userProfile.kyc_status === 'approved' && '承認済み'}
                      {userProfile.kyc_status === 'pending' && '審査中'}
                      {userProfile.kyc_status === 'rejected' && '要再申請'}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">
                      {userProfile.role === 'admin' ? '👑' : 
                       userProfile.role === 'owner' ? '🏠' : '👤'}
                    </div>
                    <div className="text-white/70 text-sm mb-1">アカウント種別</div>
                    <div className="text-white font-medium">
                      {userProfile.role === 'admin' && '管理者'}
                      {userProfile.role === 'owner' && 'オーナー'}
                      {userProfile.role === 'user' && '利用者'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VerificationRequiredPage;