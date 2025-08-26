import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../../lib/storage';
import { useAuth } from '../../components/auth/AuthProvider';
import { NavigationHeader } from '../../components/NavigationHeader';
import { getSbSchema } from '../../lib/supabase';
// Using browser alert instead of react-hot-toast

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

const AccountPage: NextPage = () => {
  const router = useRouter();
  const { user, userProfile, updateUserProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'security' | 'preferences' | 'danger'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ローカル状態でプロフィールを管理
  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({
    id: '',
    name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    birth_date: '',
    emergency_contact: '',
    emergency_phone: '',
    avatar: '',
    is_owner: false,
    is_verified: false,
    member_since: '',
    total_bookings: 0,
    total_spent: 0,
    rating: 0,
    reviews_count: 0
  });

  // パスワード変更フォーム
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // メールアドレス変更フォーム
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  
  // 認証されたユーザープロフィールをローカル状態に同期
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/profile');
        const data = await response.json();
        
        if (data.success && data.data) {
          setLocalProfile(data.data);
        } else {
          alert(data.error || 'プロフィールの取得に失敗しました');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        alert('プロフィールの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userProfile) {
      setLocalProfile(userProfile);
    } else {
      fetchProfile();
    }
  }, [user, userProfile]);
  
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
      
      // データベースに保存
      await updateUserProfile(updatedProfile);
      
      alert('アバターが更新されました');
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('アバターのアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: localProfile.name,
          phone: localProfile.phone,
          avatar: localProfile.avatar,
          license_number: localProfile.license_number,
          license_expiry: localProfile.license_expiry,
          address: localProfile.address,
          birth_date: localProfile.birth_date,
          emergency_contact: localProfile.emergency_contact,
          emergency_phone: localProfile.emergency_phone
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLocalProfile(data.data);
        await updateUserProfile(data.data);
        alert(data.message || 'プロフィールが更新されました');
        setIsEditing(false);
      } else {
        alert(data.error || 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新しいパスワードが一致しません');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('新しいパスワードは8文字以上である必要があります');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      alert('新しいパスワードには大文字、小文字、数字を含める必要があります');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'パスワードが変更されました');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error || 'パスワードの変更に失敗しました');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('パスワードの変更に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }
    
    if (emailForm.newEmail === currentProfile.email) {
      alert('新しいメールアドレスは現在のメールアドレスと異なる必要があります');
      return;
    }
    
    if (!emailForm.password) {
      alert('パスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || '確認メールを送信しました。メールを確認して変更を完了してください。');
        setShowEmailModal(false);
        setEmailForm({ newEmail: '', password: '' });
      } else {
        alert(data.error || 'メールアドレスの変更に失敗しました');
      }
    } catch (error) {
      console.error('Email change error:', error);
      alert('メールアドレスの変更に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('本当にアカウントを削除しますか？この操作は取り消せません。\n\n削除されるデータ：\n- プロフィール情報\n- 予約履歴\n- 車両情報（オーナーの場合）\n- その他すべての関連データ')) {
      return;
    }
    
    const finalConfirm = prompt('アカウント削除を確認するため、「削除」と入力してください：');
    if (finalConfirm !== '削除') {
      alert('削除がキャンセルされました');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'アカウントが削除されました');
        await signOut();
        router.push('/');
      } else {
        alert(data.error || 'アカウントの削除に失敗しました');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('アカウントの削除に失敗しました');
    } finally {
      setIsLoading(false);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>アカウント管理 - ShareNest</title>
        <meta name="description" content="アカウント設定とプロフィール管理" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <NavigationHeader showBack={true} backUrl="/app/profile" title="アカウント管理" />
        
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {avatarPreview || currentProfile.avatar ? (
                    <img
                      src={avatarPreview || currentProfile.avatar}
                      alt="プロフィール画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{currentProfile.name || 'ユーザー'}</h1>
            <p className="text-cyan-300">{currentProfile.email}</p>
            
            {currentProfile.is_verified && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm mt-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                認証済みアカウント
              </div>
            )}
          </div>

          {/* タブナビゲーション */}
          <div className="glass rounded-xl overflow-hidden mb-8">
            <div className="border-b border-white/10">
              <nav className="flex">
                {[
                  { key: 'profile', label: 'プロフィール', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { key: 'bookings', label: '予約履歴', icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v-6m2 6h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2h2z' },
                  { key: 'security', label: 'セキュリティ', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                  { key: 'preferences', label: '設定', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                  { key: 'danger', label: '危険な操作', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'border-cyan-400 text-cyan-300 bg-white/10'
                        : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
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

            {/* 予約履歴タブ */}
            {activeTab === 'bookings' && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">予約履歴</h2>
                    <p className="text-white/70 mt-1">過去の予約と今後の予定</p>
                  </div>
                  
                  <div className="space-y-6">
                    {mockBookings.map((booking) => (
                      <div key={booking.id} className="glass rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{booking.vehicle_title}</h3>
                            <p className="text-white/70 text-sm">{booking.vehicle_brand} {booking.vehicle_model}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(booking.status)}`}>
                            {booking.status === 'completed' ? '完了' : booking.status === 'cancelled' ? 'キャンセル' : '予定'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-white/60 text-xs">開始日</p>
                            <p className="text-white text-sm">{new Date(booking.start_date).toLocaleDateString('ja-JP')}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">終了日</p>
                            <p className="text-white text-sm">{new Date(booking.end_date).toLocaleDateString('ja-JP')}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">料金</p>
                            <p className="text-white text-sm">¥{booking.total_amount.toLocaleString()}</p>
                          </div>
                          {booking.rating && (
                            <div>
                              <p className="text-white/60 text-xs">評価</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < booking.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {booking.review && (
                          <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-white/60 text-xs mb-1">レビュー</p>
                            <p className="text-white text-sm">{booking.review}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* プロフィールタブ */}
            {activeTab === 'profile' && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white">プロフィール情報</h2>
                      <p className="text-white/70 mt-1">個人情報と認証状況の管理</p>
                    </div>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={isLoading}
                      className={`px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                        isLoading 
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                          : isEditing 
                            ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                      }`}
                    >
                      {isLoading ? '⏳ 処理中...' : isEditing ? '保存' : '編集'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 基本情報カード */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        基本情報
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">名前</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentProfile.name || ''}
                              onChange={(e) => handleProfileUpdate('name', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="お名前を入力"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.name || '未設定'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">電話番号</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={currentProfile.phone || ''}
                              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="電話番号を入力"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.phone || '未設定'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">住所</label>
                          {isEditing ? (
                            <textarea
                              value={currentProfile.address || ''}
                              onChange={(e) => handleProfileUpdate('address', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="住所を入力"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.address || '未設定'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 免許証情報カード */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        免許証情報
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">免許証番号</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentProfile.license_number || ''}
                              onChange={(e) => handleProfileUpdate('license_number', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="免許証番号を入力"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.license_number || '未設定'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">免許証有効期限</label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={currentProfile.license_expiry || ''}
                              onChange={(e) => handleProfileUpdate('license_expiry', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="text-white py-2">
                              {currentProfile.license_expiry 
                                ? new Date(currentProfile.license_expiry).toLocaleDateString('ja-JP')
                                : '未設定'
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">緊急連絡先</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentProfile.emergency_contact || ''}
                              onChange={(e) => handleProfileUpdate('emergency_contact', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="緊急連絡先の名前"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.emergency_contact || '未設定'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">緊急連絡先電話番号</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={currentProfile.emergency_phone || ''}
                              onChange={(e) => handleProfileUpdate('emergency_phone', e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                              placeholder="緊急連絡先の電話番号"
                            />
                          ) : (
                            <p className="text-white py-2">{currentProfile.emergency_phone || '未設定'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* セキュリティタブ */}
            {activeTab === 'security' && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">セキュリティ設定</h2>
                    <p className="text-white/70 mt-1">パスワードとメールアドレスの管理</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* パスワード変更 */}
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">パスワード</h3>
                          <p className="text-white/70 text-sm">アカウントのセキュリティを保護するため定期的に変更してください</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          変更
                        </button>
                      </div>
                    </div>

                    {/* メールアドレス変更 */}
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">メールアドレス</h3>
                          <p className="text-white/70 text-sm">{currentProfile.email}</p>
                        </div>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          変更
                        </button>
                      </div>
                    </div>

                    {/* 二段階認証 */}
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">二段階認証</h3>
                          <p className="text-white/70 text-sm">アカウントのセキュリティを強化します（近日公開予定）</p>
                        </div>
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                        >
                          設定
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 設定タブ */}
            {activeTab === 'preferences' && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">設定</h2>
                    <p className="text-white/70 mt-1">アプリケーションの設定と通知の管理</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 通知設定 */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">通知設定</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">予約確認通知</p>
                            <p className="text-white/70 text-sm">予約が確定した際の通知</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">リマインダー通知</p>
                            <p className="text-white/70 text-sm">利用開始前のリマインダー</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">プロモーション通知</p>
                            <p className="text-white/70 text-sm">特別オファーやキャンペーン情報</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 利用統計 */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">利用統計</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">12</div>
                          <div className="text-white/70 text-sm">総予約回数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">4.8</div>
                          <div className="text-white/70 text-sm">平均評価</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">¥52,000</div>
                          <div className="text-white/70 text-sm">総利用金額</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">24</div>
                          <div className="text-white/70 text-sm">利用日数</div>
                        </div>
                      </div>
                    </div>

                    {/* プライバシー設定 */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">プライバシー設定</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">プロフィール公開</p>
                            <p className="text-white/70 text-sm">他のユーザーにプロフィールを表示</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">利用履歴の共有</p>
                            <p className="text-white/70 text-sm">サービス改善のためのデータ利用</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">レビューの公開</p>
                            <p className="text-white/70 text-sm">レビューと評価を他のユーザーに表示</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 危険な操作タブ */}
            {activeTab === 'danger' && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">危険な操作</h2>
                    <p className="text-white/70 mt-1">これらの操作は取り消すことができません</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* アカウント削除 */}
                    <div className="glass rounded-xl p-6 border border-red-500/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-red-400 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            アカウント削除
                          </h3>
                          <p className="text-white/70 text-sm mt-1">
                            アカウントを完全に削除します。すべてのデータが失われ、この操作は取り消せません。
                          </p>
                          <ul className="text-white/60 text-xs mt-2 space-y-1">
                            <li>• プロフィール情報の削除</li>
                            <li>• 予約履歴の削除</li>
                            <li>• 車両情報の削除（オーナーの場合）</li>
                            <li>• レビューとレーティングの削除</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 ml-4"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">パスワード変更</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="現在のパスワード"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">新しいパスワード</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="新しいパスワード（8文字以上）"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="新しいパスワード（確認）"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? '変更中...' : '変更'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メールアドレス変更モーダル */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">メールアドレス変更</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">新しいメールアドレス</label>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="新しいメールアドレス"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">パスワード（確認用）</label>
                <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="現在のパスワード"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailForm({ newEmail: '', password: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleEmailChange}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? '変更中...' : '変更'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アカウント削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md border border-red-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">アカウント削除の確認</h3>
              <p className="text-white/70 text-sm mb-6">
                本当にアカウントを削除しますか？<br />
                この操作は取り消すことができません。
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? '削除中...' : '削除する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountPage;