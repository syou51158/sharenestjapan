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
        <title>プロフィール - ShareNest</title>
        <meta name="description" content="ユーザープロフィール管理" />
      </Head>

      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
              <h1 className="text-2xl font-bold text-gray-900">{currentProfile.name || 'ユーザー名'}</h1>
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
                className={`px-4 py-2 text-sm font-medium rounded-md ${
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
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
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
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'profile', label: 'プロフィール' },
                { key: 'bookings', label: '予約履歴' },
                { key: 'settings', label: '設定' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isUploading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : isEditing 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? '⏳ 処理中...' : isEditing ? '保存' : '編集'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.name || ''}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.name || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentProfile.phone || ''}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.phone || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">免許証番号</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.license_number || ''}
                      onChange={(e) => handleProfileUpdate('license_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.license_number || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">免許証有効期限</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={currentProfile.license_expiry || ''}
                      onChange={(e) => handleProfileUpdate('license_expiry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.license_expiry || '未設定'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                  {isEditing ? (
                    <textarea
                      value={currentProfile.address || ''}
                      onChange={(e) => handleProfileUpdate('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.address || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.emergency_contact || ''}
                      onChange={(e) => handleProfileUpdate('emergency_contact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.emergency_contact || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先電話番号</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentProfile.emergency_phone || ''}
                      onChange={(e) => handleProfileUpdate('emergency_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{currentProfile.emergency_phone || '未設定'}</p>
                  )}
                </div>
              </div>

              {/* 統計情報 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">利用統計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentProfile.total_bookings || 0}</div>
                    <div className="text-sm text-gray-600">総予約数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">¥{(currentProfile.total_spent || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">総利用金額</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{currentProfile.rating || 0}</div>
                    <div className="text-sm text-gray-600">平均評価</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{currentProfile.reviews_count || 0}</div>
                    <div className="text-sm text-gray-600">レビュー数</div>
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