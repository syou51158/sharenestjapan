import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../../lib/storage';
import { useAuth } from '../../components/auth/AuthProvider';
import { NavigationHeader } from '../../components/NavigationHeader';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  license_number: string;
  license_expiry: string;
  address: string;
  birth_date: string;
  emergency_contact: string;
  emergency_phone: string;
  is_owner: boolean;
  is_verified: boolean;
  member_since: string;
  total_bookings: number;
  total_spent: number;
  rating: number;
  reviews_count: number;
};

type BookingHistory = {
  id: string;
  vehicle_title: string;
  vehicle_brand: string;
  vehicle_model: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'completed' | 'cancelled' | 'upcoming';
  rating?: number;
  review?: string;
};

const ProfilePage: NextPage = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ローカル状態でプロフィールを管理
  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({
    name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    avatar: ''
  });
  
  // 認証されたユーザープロフィールをローカル状態に同期
  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
    }
  }, [userProfile]);
  
  // 現在のプロフィール（認証されたプロフィールまたはローカル状態）
  const currentProfile = userProfile || localProfile;

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // ファイル検証
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    
    try {
      // 古いアバターを削除（存在する場合）
      if (currentProfile.avatar) {
        await deleteAvatar(currentProfile.avatar);
      }

      // 新しいアバターをアップロード
      const avatarUrl = await uploadAvatar(file, user.id);
      
      // プレビューを表示
      setAvatarPreview(avatarUrl);
      
      // プロフィールを更新
      const updatedProfile = { ...currentProfile, avatar: avatarUrl };
      setLocalProfile(updatedProfile);
      
      if (updateUserProfile) {
        await updateUserProfile(updatedProfile);
      }
      
      alert('アバターが更新されました。');
    } catch (error) {
      console.error('アバターアップロードエラー:', error);
      alert('アバターのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      // 既存のアバターを削除
      if (currentProfile.avatar) {
        await deleteAvatar(currentProfile.avatar);
      }
      
      // プレビューとプロフィールをクリア
      setAvatarPreview(null);
      const updatedProfile = { ...currentProfile, avatar: '' };
      setLocalProfile(updatedProfile);
      
      if (updateUserProfile) {
        await updateUserProfile(updatedProfile);
      }
      
      alert('アバターが削除されました。');
    } catch (error) {
      console.error('アバター削除エラー:', error);
      alert('アバターの削除に失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!updateUserProfile) return;
    
    setIsUploading(true);
    
    try {
      await updateUserProfile({
        name: currentProfile.name,
        phone: currentProfile.phone,
        avatar: currentProfile.avatar,
        license_number: currentProfile.license_number,
        license_expiry: currentProfile.license_expiry,
        address: currentProfile.address,
        emergency_contact: currentProfile.emergency_contact,
        emergency_phone: currentProfile.emergency_phone
      });
      
      setIsEditing(false);
      alert('プロフィールが更新されました。');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const mockBookings: BookingHistory[] = [
    {
      id: '1',
      vehicle_title: 'トヨタ プリウス 2022',
      vehicle_brand: 'トヨタ',
      vehicle_model: 'プリウス',
      start_date: '2024-01-15',
      end_date: '2024-01-17',
      total_amount: 15000,
      status: 'completed',
      rating: 5,
      review: '非常に快適でした。'
    },
    {
      id: '2',
      vehicle_title: 'ホンダ フィット 2023',
      vehicle_brand: 'ホンダ',
      vehicle_model: 'フィット',
      start_date: '2024-02-10',
      end_date: '2024-02-12',
      total_amount: 12000,
      status: 'completed',
      rating: 4
    },
    {
      id: '3',
      vehicle_title: 'マツダ CX-5 2023',
      vehicle_brand: 'マツダ',
      vehicle_model: 'CX-5',
      start_date: '2024-03-20',
      end_date: '2024-03-22',
      total_amount: 25000,
      status: 'upcoming'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>マイアカウント - ShareNest</title>
        <meta name="description" content="マイアカウント管理ページ" />
      </Head>

      <NavigationHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">マイアカウント</h1>
          <p className="mt-2 text-gray-600">アカウント情報の管理とサービス設定</p>
        </div>
        
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {isUploading ? (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <img
                  src={avatarPreview || currentProfile.avatar || '/api/placeholder/150/150'}
                  alt="プロフィール画像"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{currentProfile.name || 'ユーザー名'}</h2>
              <p className="text-gray-600">{currentProfile.email || user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentProfile.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentProfile.is_verified ? '認証済み' : '未認証'}
                </span>
                {currentProfile.is_owner && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    オーナー
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isUploading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'アップロード中...' : 'アイコン変更'}
              </button>
              {currentProfile.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isUploading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isUploading ? '削除中...' : 'アイコン削除'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-0">
              {[
                { key: 'profile', label: 'プロフィール', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'bookings', label: '利用履歴', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { key: 'owner', label: 'オーナー登録', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
                { key: 'settings', label: '設定', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">プロフィール情報</h2>
                    <p className="text-gray-600 mt-1">個人情報と認証状況の管理</p>
                  </div>
                  <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={isUploading}
                    className={`px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      isUploading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : isEditing 
                          ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    }`}
                  >
                    {isUploading ? '⏳ 処理中...' : isEditing ? '保存' : '編集'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 基本情報カード */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      基本情報
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentProfile.name || ''}
                            onChange={(e) => handleProfileUpdate('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{currentProfile.name || '未設定'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={currentProfile.phone || ''}
                            onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{currentProfile.phone || '未設定'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 免許証情報カード */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      免許証情報
                    </h3>
                    <div className="space-y-6">

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">免許証番号</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentProfile.license_number || ''}
                            onChange={(e) => handleProfileUpdate('license_number', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{currentProfile.license_number || '未設定'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">免許証有効期限</label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={currentProfile.license_expiry || ''}
                            onChange={(e) => handleProfileUpdate('license_expiry', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{currentProfile.license_expiry || '未設定'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 住所情報カード */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    住所情報
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                    {isEditing ? (
                      <textarea
                        value={currentProfile.address || ''}
                        onChange={(e) => handleProfileUpdate('address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{currentProfile.address || '未設定'}</p>
                    )}
                  </div>
                </div>

                {/* 緊急連絡先カード */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    緊急連絡先
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentProfile.emergency_contact || ''}
                          onChange={(e) => handleProfileUpdate('emergency_contact', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{currentProfile.emergency_contact || '未設定'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先電話番号</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={currentProfile.emergency_phone || ''}
                          onChange={(e) => handleProfileUpdate('emergency_phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{currentProfile.emergency_phone || '未設定'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    利用統計
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{currentProfile.total_bookings || 0}</div>
                      <div className="text-sm text-gray-600">総予約数</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-green-600 mb-1">¥{(currentProfile.total_spent || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">総利用金額</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-yellow-600 mb-1">{currentProfile.rating || 0}</div>
                      <div className="text-sm text-gray-600">平均評価</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{currentProfile.reviews_count || 0}</div>
                      <div className="text-sm text-gray-600">レビュー数</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 予約履歴タブ */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">予約履歴</h2>
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.vehicle_title}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.start_date} 〜 {booking.end_date}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ¥{booking.total_amount.toLocaleString()}
                        </p>
                        {booking.rating && (
                          <div className="flex items-center mt-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < booking.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">({booking.rating})</span>
                          </div>
                        )}
                        {booking.review && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{booking.review}"</p>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                          getStatusColor(booking.status)
                        }`}>
                          {booking.status === 'completed' ? '完了' : 
                           booking.status === 'cancelled' ? 'キャンセル' : '予約中'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* オーナー登録タブ */}
          {activeTab === 'owner' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">オーナー登録</h2>
              
              {currentProfile.is_owner ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-800">オーナー登録済み</h3>
                  </div>
                  <p className="text-green-700 mb-4">あなたは既にオーナーとして登録されています。車両の登録や管理はオーナーダッシュボードから行えます。</p>
                  <a
                    href="/app/owner/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    オーナーダッシュボードへ
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">車両オーナーになりませんか？</h3>
                    <p className="text-blue-700 mb-4">
                      ShareNestで車両オーナーになると、あなたの車を他のユーザーにシェアして収益を得ることができます。
                      安全で信頼性の高いプラットフォームで、新しい収入源を見つけましょう。
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">収益獲得</h4>
                        <p className="text-sm text-gray-600">月平均3-8万円の副収入</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">安心保険</h4>
                        <p className="text-sm text-gray-600">24時間サポート付き</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">簡単管理</h4>
                        <p className="text-sm text-gray-600">アプリで全て完結</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">オーナー登録の要件</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-3 ${currentProfile.is_verified ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentProfile.is_verified ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                        <span className={currentProfile.is_verified ? 'text-green-700' : 'text-gray-600'}>
                          本人確認の完了 {currentProfile.is_verified ? '✓' : '(未完了)'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-3 ${currentProfile.license_number ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentProfile.license_number ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                        <span className={currentProfile.license_number ? 'text-green-700' : 'text-gray-600'}>
                          有効な運転免許証 {currentProfile.license_number ? '✓' : '(未登録)'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">車両登録書類の準備</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      {currentProfile.is_verified && currentProfile.license_number ? (
                        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">
                          オーナー登録を開始
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {!currentProfile.is_verified && (
                            <a
                              href="/app/verification-required"
                              className="block w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors duration-200 font-medium text-center"
                            >
                              本人確認を完了する
                            </a>
                          )}
                          {!currentProfile.license_number && (
                            <button
                              onClick={() => setActiveTab('profile')}
                              className="block w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
                            >
                              免許証情報を登録する
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 設定タブ */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">アカウント設定</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">通知設定</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">予約確認メール</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">プロモーションメール</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">SMS通知</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">プライバシー設定</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">プロフィールを公開</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">レビューを公開</span>
                    </label>
                  </div>
                </div>

                <div className="border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">危険な操作</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    アカウントを削除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* アカウント削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント削除の確認</h3>
            <p className="text-gray-600 mb-6">
              本当にアカウントを削除しますか？この操作は取り消せません。
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // アカウント削除処理をここに実装
                  setShowDeleteModal(false);
                  alert('アカウント削除機能は未実装です。');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;