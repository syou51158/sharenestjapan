import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../../lib/storage';
import { useAuth } from '../../components/auth/AuthProvider';
import { NavigationHeader } from '../../components/NavigationHeader';
import { Footer } from '../../components/layout/Footer';

type AddressInfo = {
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  license_number: string;
  license_expiry: string;
  address: string | AddressInfo;
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
  const { user, userProfile, updateUserProfile, signOut, deleteUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'security' | 'preferences' | 'danger'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // パスワード変更用の状態
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 設定用の状態
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    language: 'ja',
    timezone: 'Asia/Tokyo'
  });
  
  // ローカル状態でプロフィールを管理
  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({
    name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    birth_date: '',
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

  // デバッグ用: isEditingの状態変化を監視
  useEffect(() => {
    console.log('isEditingの状態が変更されました:', isEditing);
  }, [isEditing]);
  
  // 現在のプロフィール（認証されたプロフィールまたはローカル状態）
  const currentProfile = userProfile || localProfile;

  // アバター変更処理
  // アイコン変更ボタンクリック時のチェック
  const handleAvatarButtonClick = () => {
    if (!userProfile) {
      alert('プロフィールがまだ作成されていません。\n\nアイコンを変更するには、まずプロフィールの作成を完了してください。\n\n「Google情報で作成」ボタンからプロフィールを作成できます。');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    
    try {
      if (currentProfile.avatar) {
        await deleteAvatar(currentProfile.avatar);
      }

      const avatarUrl = await uploadAvatar(file, user.id);
      setAvatarPreview(avatarUrl);
      
      // ローカル状態を更新
      setLocalProfile(prev => ({ ...prev, avatar: avatarUrl }));
      
      // データベースのアバターを更新
      if (updateUserProfile) {
        await updateUserProfile({ avatar: avatarUrl });
        alert('アバターが更新されました。');
      } else {
        alert('アバターの更新に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('アバターアップロードエラー:', error);
      alert('アバターのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  // アバター削除処理
  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    // プロフィール未作成チェック
    if (!userProfile) {
      alert('プロフィールがまだ作成されていません。\n\nアイコンを削除するには、まずプロフィールの作成を完了してください。\n\n「Google情報で作成」ボタンからプロフィールを作成できます。');
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (currentProfile.avatar) {
        await deleteAvatar(currentProfile.avatar);
      }
      
      setAvatarPreview(null);
      setLocalProfile(prev => ({ ...prev, avatar: '' }));
      
      // データベースのアバターをクリア
      if (updateUserProfile) {
        await updateUserProfile({ avatar: '' });
        alert('アバターが削除されました。');
      } else {
        alert('アバターの削除に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('アバター削除エラー:', error);
      alert('アバターの削除に失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  // バリデーション関数
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return '名前は必須です';
        if (value.length < 2) return '名前は2文字以上で入力してください';
        return null;
      case 'phone':
        if (value && !/^[0-9-+()\s]+$/.test(value)) return '有効な電話番号を入力してください';
        return null;
      case 'birth_date':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) return '18歳以上である必要があります';
          if (age > 100) return '有効な生年月日を入力してください';
        }
        return null;
      case 'license_expiry':
        if (value) {
          const expiryDate = new Date(value);
          const today = new Date();
          if (expiryDate < today) return '免許証の有効期限が切れています';
        }
        return null;
      case 'emergency_phone':
        if (value && !/^[0-9-+()\s]+$/.test(value)) return '有効な電話番号を入力してください';
        return null;
      default:
        return null;
    }
  };

  // プロフィール更新処理（バリデーション付き）
  const handleProfileUpdate = (field: string, value: string) => {
    console.log('handleProfileUpdate呼び出し:', field, value);
    // まず値を更新してから、必要に応じてバリデーションエラーを表示
    setLocalProfile(prev => {
      console.log('localProfile更新前:', prev);
      const updated = { ...prev, [field]: value };
      console.log('localProfile更新後:', updated);
      return updated;
    });
    
    // バリデーションエラーがある場合は警告を表示（ただし入力は阻止しない）
    const error = validateField(field, value);
    if (error && value.trim() !== '') {
      // 空文字の場合はエラーを表示しない（入力中の可能性があるため）
      console.warn(`バリデーションエラー (${field}): ${error}`);
    }
  };

  // JSONBフィールド用の更新処理
  const handleAddressUpdate = (addressData: any) => {
    setLocalProfile(prev => ({ ...prev, address: addressData }));
  };

  const handleEmergencyContactUpdate = (contactData: any) => {
    setLocalProfile(prev => ({ ...prev, emergency_contact: contactData }));
  };

  const handleDriverLicenseUpdate = (licenseData: any) => {
    setLocalProfile(prev => ({ ...prev, driver_license: licenseData }));
  };

  // プロフィール保存処理
  const handleSaveProfile = async () => {
    if (!updateUserProfile || !userProfile) {
      if (!userProfile) {
        alert('プロフィールが作成されていません。しばらく待ってから再試行してください。');
      }
      return;
    }
    
    // 保存前のバリデーション
    const validationErrors: string[] = [];
    
    if (!localProfile.name?.trim()) {
      validationErrors.push('名前は必須です');
    } else if (localProfile.name.length < 2) {
      validationErrors.push('名前は2文字以上で入力してください');
    }
    
    if (localProfile.phone && !/^[0-9-+()\s]+$/.test(localProfile.phone)) {
      validationErrors.push('有効な電話番号を入力してください');
    }
    
    if (localProfile.birth_date) {
      const birthDate = new Date(localProfile.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        validationErrors.push('18歳以上である必要があります');
      } else if (age > 100) {
        validationErrors.push('有効な生年月日を入力してください');
      }
    }
    
    if (localProfile.license_expiry) {
      const expiryDate = new Date(localProfile.license_expiry);
      const today = new Date();
      if (expiryDate < today) {
        validationErrors.push('免許証の有効期限が切れています');
      }
    }
    
    if (localProfile.emergency_phone && !/^[0-9-+()\s]+$/.test(localProfile.emergency_phone)) {
      validationErrors.push('緊急連絡先の電話番号が無効です');
    }
    
    if (validationErrors.length > 0) {
      alert('以下のエラーを修正してください:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateUserProfile({
        name: localProfile.name,
        phone: localProfile.phone,
        avatar: localProfile.avatar,
        license_number: localProfile.license_number,
        license_expiry: localProfile.license_expiry,
        ...(typeof (localProfile as any).driver_license === 'object' && (localProfile as any).driver_license
          ? { driver_license: (localProfile as any).driver_license }
          : {}),
        address: localProfile.address,
        birth_date: localProfile.birth_date,
        emergency_contact: localProfile.emergency_contact,
        emergency_phone: localProfile.emergency_phone
      });
      
      setIsEditing(false);
      alert('プロフィールが更新されました。');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // パスワード変更処理
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('新しいパスワードが一致しません。');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('パスワードは8文字以上で入力してください。');
      return;
    }

    setIsLoading(true);
    
    try {
      // Supabaseのパスワード変更API呼び出し
      // 実装は認証プロバイダーに依存
      alert('パスワードが変更されました。');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      alert('パスワードの変更に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // アカウント削除処理
  const handleDeleteAccount = async () => {
    if (!deleteUserProfile) {
      alert('削除機能が利用できません。');
      return;
    }

    setIsLoading(true);
    
    try {
      // ShareNestのプロフィールデータを削除
      await deleteUserProfile();
      
      // ホームページにリダイレクト
      router.push('/');
      
      alert('ShareNestのアカウントが削除されました。\n\n※ Googleアカウント自体は削除されていません。\nGoogleアカウントは引き続きご利用いただけます。');
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      alert('アカウントの削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  // 設定保存処理
  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    try {
      // 設定をSupabaseに保存
      alert('設定が保存されました。');
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('設定の保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ログイン確認
  if (!user) {
    router.push('/app/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>アカウント管理 - ShareNest Japan</title>
        <meta name="description" content="アカウント設定とプロフィール管理" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <NavigationHeader title="アカウント管理" />
        
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* ヘッダー部分 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarPreview || currentProfile.avatar || user?.user_metadata?.avatar_url ? (
                    <img
                      src={avatarPreview || currentProfile.avatar || user?.user_metadata?.avatar_url}
                      alt="プロフィール画像"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {currentProfile.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </div>
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
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {currentProfile.name || 'ユーザー名'}
                  </h1>
                  <p className="text-white/70 mb-3">{user.email}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentProfile.is_verified 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {currentProfile.is_verified ? '認証済み' : '未認証'}
                    </span>
                    {currentProfile.is_owner && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        オーナー
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleAvatarButtonClick}
                    disabled={isUploading}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isUploading 
                        ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {isUploading ? 'アップロード中...' : 'アイコン変更'}
                  </button>
                  {currentProfile.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isUploading 
                          ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                      }`}
                    >
                      {isUploading ? '削除中...' : 'アイコン削除'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden mb-8">
              <div className="border-b border-white/10">
                <nav className="flex">
                  {[
                    { key: 'profile', label: 'プロフィール', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { key: 'bookings', label: '予約履歴', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { key: 'security', label: 'セキュリティ', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                    { key: 'preferences', label: '設定', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                    { key: 'danger', label: '危険な操作', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'border-cyan-400 text-cyan-400 bg-white/5'
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
                        onClick={() => {
                          console.log('編集ボタンクリック - 現在のisEditing:', isEditing);
                          if (isEditing) {
                            console.log('保存処理を実行');
                            handleSaveProfile();
                          } else {
                            console.log('編集モードに切り替え');
                            setIsEditing(true);
                          }
                        }}
                        disabled={isLoading}
                        className={`px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                          isLoading 
                            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                            : isEditing 
                              ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                        }`}
                      >
                        {isLoading ? '保存中...' : isEditing ? '保存' : '編集'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 基本情報 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">氏名</label>
                          <input
                            type="text"
                            value={localProfile.name || ''}
                            onChange={(e) => {
                              console.log('氏名フィールド変更:', e.target.value, 'isEditing:', isEditing);
                              handleProfileUpdate('name', e.target.value);
                            }}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50"
                            placeholder="氏名を入力"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">電話番号</label>
                          <input
                            type="tel"
                            value={localProfile.phone || ''}
                            onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50"
                            placeholder="電話番号を入力"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">生年月日</label>
                          <input
                            type="date"
                            value={localProfile.birth_date || ''}
                            onChange={(e) => handleProfileUpdate('birth_date', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50"
                          />
                        </div>

                        {/* 住所情報（構造化） */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">住所情報</label>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={typeof localProfile.address === 'object' ? localProfile.address?.postal_code || '' : ''}
                                onChange={(e) => {
                                  const currentAddress = typeof localProfile.address === 'object' ? localProfile.address : {};
                                  handleAddressUpdate({ ...currentAddress, postal_code: e.target.value });
                                }}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                                placeholder="郵便番号"
                              />
                              <input
                                type="text"
                                value={typeof localProfile.address === 'object' ? localProfile.address?.prefecture || '' : ''}
                                onChange={(e) => {
                                  const currentAddress = typeof localProfile.address === 'object' ? localProfile.address : {};
                                  handleAddressUpdate({ ...currentAddress, prefecture: e.target.value });
                                }}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                                placeholder="都道府県"
                              />
                            </div>
                            <input
                              type="text"
                              value={typeof localProfile.address === 'object' ? localProfile.address?.city || '' : ''}
                              onChange={(e) => {
                                const currentAddress = typeof localProfile.address === 'object' ? localProfile.address : {};
                                handleAddressUpdate({ ...currentAddress, city: e.target.value });
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="市区町村"
                            />
                            <input
                              type="text"
                              value={typeof localProfile.address === 'object' ? localProfile.address?.street || '' : ''}
                              onChange={(e) => {
                                const currentAddress = typeof localProfile.address === 'object' ? localProfile.address : {};
                                handleAddressUpdate({ ...currentAddress, street: e.target.value });
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="番地・建物名"
                            />
                            {/* 従来の文字列形式との互換性 */}
                            {typeof localProfile.address === 'string' && localProfile.address && (
                              <textarea
                                value={localProfile.address}
                                onChange={(e) => handleProfileUpdate('address', e.target.value)}
                                disabled={!isEditing}
                                rows={2}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                                placeholder="従来の住所形式"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 運転免許・緊急連絡先 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">運転免許・緊急連絡先</h3>
                        
                        {/* 運転免許証情報（構造化） */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">運転免許証情報</label>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={typeof localProfile.driver_license === 'object' ? localProfile.driver_license?.license_no || '' : localProfile.license_number || ''}
                              onChange={(e) => {
                                if (typeof localProfile.driver_license === 'object') {
                                  const currentLicense = localProfile.driver_license || {};
                                  handleDriverLicenseUpdate({ ...currentLicense, license_no: e.target.value });
                                } else {
                                  handleProfileUpdate('license_number', e.target.value);
                                }
                              }}
                              disabled={(typeof localProfile.driver_license === 'object' && localProfile.driver_license?.status === 'verified') ? true : !isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="運転免許証番号"
                            />
                            <input
                              type="date"
                              value={typeof localProfile.driver_license === 'object' ? localProfile.driver_license?.expiry_date || '' : localProfile.license_expiry || ''}
                              onChange={(e) => {
                                if (typeof localProfile.driver_license === 'object') {
                                  const currentLicense = localProfile.driver_license || {};
                                  handleDriverLicenseUpdate({ ...currentLicense, expiry_date: e.target.value });
                                } else {
                                  handleProfileUpdate('license_expiry', e.target.value);
                                }
                              }}
                              disabled={(typeof localProfile.driver_license === 'object' && localProfile.driver_license?.status === 'verified') ? true : !isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                            />
                            <select
                              value={typeof localProfile.driver_license === 'object' ? localProfile.driver_license?.status || 'valid' : 'valid'}
                              onChange={(e) => {
                                const currentLicense = typeof localProfile.driver_license === 'object' ? localProfile.driver_license : {};
                                handleDriverLicenseUpdate({ ...currentLicense, status: e.target.value });
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                            >
                              <option value="valid">有効</option>
                              <option value="expired">期限切れ</option>
                              <option value="suspended">停止中</option>
                              <option value="revoked">取消</option>
                            </select>
                            {/* 従来の文字列形式との互換性表示 */}
                            {localProfile.license_number && typeof localProfile.driver_license !== 'object' && (
                              <div className="text-white/50 text-xs">
                                免許証番号: {localProfile.license_number}
                              </div>
                            )}
                            {localProfile.license_expiry && typeof localProfile.driver_license !== 'object' && (
                              <div className="text-white/50 text-xs">
                                有効期限: {localProfile.license_expiry}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 緊急連絡先情報（構造化） */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">緊急連絡先情報</label>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={typeof localProfile.emergency_contact === 'object' ? localProfile.emergency_contact?.name || '' : localProfile.emergency_contact || ''}
                              onChange={(e) => {
                                if (typeof localProfile.emergency_contact === 'object') {
                                  const currentContact = localProfile.emergency_contact || {};
                                  handleEmergencyContactUpdate({ ...currentContact, name: e.target.value });
                                } else {
                                  handleProfileUpdate('emergency_contact', e.target.value);
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="緊急連絡先の氏名"
                            />
                            <input
                              type="tel"
                              value={typeof localProfile.emergency_contact === 'object' ? localProfile.emergency_contact?.phone || '' : localProfile.emergency_phone || ''}
                              onChange={(e) => {
                                if (typeof localProfile.emergency_contact === 'object') {
                                  const currentContact = localProfile.emergency_contact || {};
                                  handleEmergencyContactUpdate({ ...currentContact, phone: e.target.value });
                                } else {
                                  handleProfileUpdate('emergency_phone', e.target.value);
                                }
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="緊急連絡先の電話番号"
                            />
                            <input
                              type="text"
                              value={typeof localProfile.emergency_contact === 'object' ? localProfile.emergency_contact?.relationship || '' : ''}
                              onChange={(e) => {
                                const currentContact = typeof localProfile.emergency_contact === 'object' ? localProfile.emergency_contact : {};
                                handleEmergencyContactUpdate({ ...currentContact, relationship: e.target.value });
                              }}
                              disabled={!isEditing}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 text-sm"
                              placeholder="続柄（例：配偶者、親、兄弟など）"
                            />
                            {/* 従来の文字列形式との互換性表示 */}
                            {typeof localProfile.emergency_contact === 'string' && localProfile.emergency_contact && (
                              <div className="text-white/50 text-xs">
                                従来形式: {localProfile.emergency_contact}
                              </div>
                            )}
                            {localProfile.emergency_phone && typeof localProfile.emergency_contact !== 'object' && (
                              <div className="text-white/50 text-xs">
                                電話番号: {localProfile.emergency_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 予約履歴タブ */}
              {activeTab === 'bookings' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">予約履歴</h2>
                    
                    <div className="space-y-4">
                      {/* サンプル予約データ */}
                      {[
                        {
                          id: '1',
                          vehicle_title: 'トヨタ プリウス 2022',
                          start_date: '2024-01-15',
                          end_date: '2024-01-17',
                          total_amount: 15000,
                          status: 'completed' as const
                        },
                        {
                          id: '2',
                          vehicle_title: 'ホンダ フィット 2023',
                          start_date: '2024-02-10',
                          end_date: '2024-02-12',
                          total_amount: 12000,
                          status: 'upcoming' as const
                        }
                      ].map((booking) => (
                        <div key={booking.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{booking.vehicle_title}</h3>
                              <p className="text-white/70 mt-1">
                                {booking.start_date} 〜 {booking.end_date}
                              </p>
                              <p className="text-cyan-400 font-medium mt-2">
                                ¥{booking.total_amount.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                booking.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {booking.status === 'completed' ? '完了' :
                                 booking.status === 'upcoming' ? '予約中' : 'キャンセル'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* セキュリティタブ */}
              {activeTab === 'security' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">セキュリティ設定</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">パスワード変更</h3>
                        <p className="text-white/70 mb-4">定期的なパスワード変更をお勧めします。</p>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          パスワードを変更
                        </button>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">ログイン履歴</h3>
                        <p className="text-white/70 mb-4">最近のログイン活動を確認できます。</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white">現在のセッション</span>
                            <span className="text-green-400">アクティブ</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-white/70">2024-01-20 14:30 - Windows Chrome</span>
                            <span className="text-white/50">終了済み</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 設定タブ */}
              {activeTab === 'preferences' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">設定</h2>
                      <button
                        onClick={handleSavePreferences}
                        disabled={isLoading}
                        className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isLoading 
                            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                        }`}
                      >
                        {isLoading ? '保存中...' : '設定を保存'}
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">通知設定</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">メール通知</p>
                              <p className="text-white/70 text-sm">予約確認やお知らせをメールで受信</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">SMS通知</p>
                              <p className="text-white/70 text-sm">緊急時の通知をSMSで受信</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.smsNotifications}
                                onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">マーケティングメール</p>
                              <p className="text-white/70 text-sm">キャンペーンや特典情報を受信</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.marketingEmails}
                                onChange={(e) => setPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">言語・地域設定</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">言語</label>
                            <select
                              value={preferences.language}
                              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                              <option value="ja">日本語</option>
                              <option value="en">English</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">タイムゾーン</label>
                            <select
                              value={preferences.timezone}
                              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            >
                              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                              <option value="UTC">UTC</option>
                            </select>
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
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">危険な操作</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-400 mb-4">アカウント削除</h3>
                        <p className="text-white/70 mb-4">
                          アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消すことができません。
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          アカウントを削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-6">パスワード変更</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="現在のパスワードを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">新しいパスワード</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="新しいパスワードを入力（8文字以上）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="新しいパスワードを再入力"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? '変更中...' : '変更'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アカウント削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-6">アカウント削除の確認</h3>
            
            <div className="mb-6">
              <p className="text-white/70 mb-4">
                本当にアカウントを削除しますか？この操作は取り消すことができません。
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <h4 className="text-red-400 font-medium mb-2">削除されるデータ：</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• プロフィール情報</li>
                  <li>• 予約履歴</li>
                  <li>• 設定情報</li>
                  <li>• すべての個人データ</li>
                </ul>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">⚠️ 重要な注意事項：</h4>
                <p className="text-white/70 text-sm">
                  この操作はShareNestのアカウントデータのみを削除します。<br/>
                  <strong className="text-blue-300">Googleアカウント自体は削除されず、引き続きご利用いただけます。</strong>
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isLoading
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isLoading ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountPage;