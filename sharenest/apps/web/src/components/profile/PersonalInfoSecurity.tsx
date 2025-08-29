import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface PersonalInfoSecurityProps {
  userProfile: any;
  onUpdateProfile: (updates: any) => Promise<void>;
}

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'privacy' | 'notification' | 'access';
  icon: string;
}

interface ChangeLogEntry {
  id: string;
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reason?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  category: 'personal' | 'contact' | 'verification' | 'security';
}

interface ApprovalRequest {
  id: string;
  type: 'profile_update' | 'email_change' | 'phone_change' | 'address_change';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  data: any;
}

const PersonalInfoSecurity: React.FC<PersonalInfoSecurityProps> = ({ userProfile, onUpdateProfile }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'sessions'>('settings');
  const [isLoading, setIsLoading] = useState(false);

  // セキュリティ設定の定義
  const securitySettings: SecuritySetting[] = [
    {
      id: 'profile_visibility',
      title: 'プロフィール公開設定',
      description: '他のユーザーがあなたのプロフィール情報を閲覧できるかどうかを設定します',
      enabled: userProfile?.profile_public ?? true,
      category: 'privacy',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    },
    {
      id: 'contact_info_sharing',
      title: '連絡先情報の共有',
      description: '予約確定時に電話番号やメールアドレスを相手に表示します',
      enabled: userProfile?.contact_sharing ?? true,
      category: 'privacy',
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
    },
    {
      id: 'location_sharing',
      title: '位置情報の共有',
      description: '現在地を利用した車両検索や推奨機能を有効にします',
      enabled: userProfile?.location_sharing ?? false,
      category: 'privacy',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
    },
    {
      id: 'booking_notifications',
      title: '予約通知',
      description: '新しい予約や予約変更時にメール・プッシュ通知を受け取ります',
      enabled: userProfile?.booking_notifications ?? true,
      category: 'notification',
      icon: 'M15 17h5l-5 5v-5z M4 19h6v-6H4v6z M16 3h5v5h-5V3z M4 3h6v6H4V3z'
    },
    {
      id: 'marketing_notifications',
      title: 'マーケティング通知',
      description: 'キャンペーンやお得な情報の通知を受け取ります',
      enabled: userProfile?.marketing_notifications ?? false,
      category: 'notification',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
    },
    {
      id: 'security_alerts',
      title: 'セキュリティアラート',
      description: '不審なログインや設定変更時に通知を受け取ります',
      enabled: userProfile?.security_alerts ?? true,
      category: 'notification',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    },
    {
      id: 'two_factor_auth',
      title: '二段階認証',
      description: 'ログイン時に追加の認証ステップを要求します',
      enabled: userProfile?.two_factor_enabled ?? false,
      category: 'access',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
      id: 'session_timeout',
      title: '自動ログアウト',
      description: '一定時間操作がない場合に自動的にログアウトします',
      enabled: userProfile?.auto_logout ?? true,
      category: 'access',
      icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    }
  ];

  // 変更履歴のモックデータ（実際にはAPIから取得）
  const changeHistory: ChangeLogEntry[] = [
    {
      id: '1',
      field: 'email',
      fieldLabel: 'メールアドレス',
      oldValue: 'old@example.com',
      newValue: 'new@example.com',
      status: 'approved',
      requestedAt: new Date('2024-01-15T10:30:00'),
      reviewedAt: new Date('2024-01-16T10:30:00'),
      reviewedBy: 'システム管理者',
      timestamp: new Date('2024-01-15T10:30:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      category: 'contact'
    },
    {
      id: '2',
      field: 'phone',
      fieldLabel: '電話番号',
      oldValue: '090-1234-5678',
      newValue: '090-8765-4321',
      status: 'pending',
      requestedAt: new Date('2024-01-10T14:20:00'),
      timestamp: new Date('2024-01-10T14:20:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      category: 'contact'
    },
    {
      id: '3',
      field: 'address',
      fieldLabel: '住所',
      oldValue: '東京都渋谷区...',
      newValue: '東京都新宿区...',
      status: 'rejected',
      requestedAt: new Date('2024-01-05T09:15:00'),
      reviewedAt: new Date('2024-01-06T09:15:00'),
      reviewedBy: 'システム管理者',
      reason: '住所確認書類が不鮮明です',
      timestamp: new Date('2024-01-05T09:15:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      category: 'personal'
    }
  ];

  const [approvalRequests] = useState<ApprovalRequest[]>([
    {
      id: '1',
      type: 'email_change',
      description: 'メールアドレスの変更申請',
      status: 'pending',
      submittedAt: new Date('2024-01-20'),
      data: { newEmail: 'newemail@example.com' }
    },
    {
      id: '2',
      type: 'address_change',
      description: '住所変更申請',
      status: 'approved',
      submittedAt: new Date('2024-01-15'),
      reviewedAt: new Date('2024-01-16'),
      data: { newAddress: '東京都港区...' }
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSettingToggle = async (settingId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await onUpdateProfile({ [settingId]: enabled });
    } catch (error) {
      console.error('Setting update error:', error);
      alert('設定の更新に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    // パスワード変更モーダルを開く
    alert('パスワード変更機能は別途実装予定です。');
  };

  const handleTwoFactorSetup = () => {
    // 二段階認証設定モーダルを開く
    alert('二段階認証設定機能は別途実装予定です。');
  };

  const handleSessionRevoke = (sessionId: string) => {
    // セッション無効化
    alert(`セッション ${sessionId} を無効化しました。`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'privacy': return 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z';
      case 'notification': return 'M15 17h5l-5 5v-5z';
      case 'access': return 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z';
      case 'personal': return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case 'contact': return 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
      case 'verification': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'security': return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      default: return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      default: return '不明';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'personal': return '個人情報';
      case 'contact': return '連絡先';
      case 'verification': return '認証情報';
      case 'security': return 'セキュリティ';
      default: return 'その他';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'profile_update': return 'プロフィール更新';
      case 'email_change': return 'メールアドレス変更';
      case 'phone_change': return '電話番号変更';
      case 'address_change': return '住所変更';
      default: return 'その他';
    }
  };

  const filteredChanges = changeHistory.filter(change => {
    const categoryMatch = filterCategory === 'all' || change.category === filterCategory;
    const statusMatch = filterStatus === 'all' || change.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const pendingChanges = changeHistory.filter(change => change.status === 'pending');
  const pendingRequests = approvalRequests.filter(request => request.status === 'pending');

  const cancelRequest = async (changeId: string) => {
    if (confirm('この申請をキャンセルしますか？')) {
      // 実際の実装では API を呼び出す
      alert('申請をキャンセルしました。');
    }
  };

  const resubmitRequest = async (changeId: string) => {
    const change = changeHistory.find(c => c.id === changeId);
    if (change) {
      // 実際の実装では API を呼び出す
      alert('申請を再送信しました。');
    }
  };

  const groupedSettings = securitySettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SecuritySetting[]>);

  const categoryNames = {
    privacy: 'プライバシー設定',
    notification: '通知設定',
    access: 'アクセス制御'
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          個人情報セキュリティ
        </h3>
        
        {/* タブナビゲーション */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'settings', label: 'セキュリティ設定' },
            { id: 'history', label: '変更履歴' },
            { id: 'sessions', label: 'ログインセッション' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* セキュリティ設定タブ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, settings]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-white font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(category)} />
                  </svg>
                  {categoryNames[category as keyof typeof categoryNames]}
                </h4>
                
                <div className="grid gap-3">
                  {settings.map((setting) => (
                    <div key={setting.id} className="glass rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={setting.icon} />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{setting.title}</h5>
                            <p className="text-white/70 text-sm mt-1">{setting.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.enabled}
                              onChange={(e) => handleSettingToggle(setting.id, e.target.checked)}
                              disabled={isLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* 追加のセキュリティアクション */}
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                セキュリティアクション
              </h4>
              
              <div className="grid gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="glass rounded-lg p-4 border border-white/10 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <div>
                        <h5 className="text-white font-medium">パスワード変更</h5>
                        <p className="text-white/70 text-sm">アカウントのパスワードを変更します</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button
                  onClick={handleTwoFactorSetup}
                  className="glass rounded-lg p-4 border border-white/10 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div>
                        <h5 className="text-white font-medium">二段階認証設定</h5>
                        <p className="text-white/70 text-sm">アカウントのセキュリティを強化します</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 変更履歴タブ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">個人情報変更履歴</h4>
              <span className="text-white/60 text-sm">過去30日間</span>
            </div>
            
            {/* フィルター */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <label className="text-white/70 text-sm">カテゴリ:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="personal">個人情報</option>
                  <option value="contact">連絡先</option>
                  <option value="verification">認証情報</option>
                  <option value="security">セキュリティ</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-white/70 text-sm">ステータス:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="pending">承認待ち</option>
                  <option value="approved">承認済み</option>
                  <option value="rejected">却下</option>
                </select>
              </div>
            </div>
            
            {/* 承認待ちの変更がある場合の警告 */}
            {pendingChanges.length > 0 && (
              <div className="glass rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h5 className="text-yellow-300 font-medium">承認待ちの変更があります</h5>
                </div>
                <p className="text-yellow-200/80 text-sm">
                  {pendingChanges.length}件の変更申請が承認待ちです。承認されるまで変更は反映されません。
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {filteredChanges.map((entry) => (
                <div key={entry.id} className="glass rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(entry.category)} />
                        </svg>
                        <h5 className="text-white font-medium">{entry.fieldLabel}の変更</h5>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(entry.status)}`}>
                          {getStatusText(entry.status)}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {getCategoryText(entry.category)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-white/70">
                          <span className="text-red-400">変更前:</span> {entry.oldValue}
                        </div>
                        <div className="text-white/70">
                          <span className="text-green-400">変更後:</span> {entry.newValue}
                        </div>
                        {entry.reason && (
                          <div className="text-white/70">
                            <span className="text-orange-400">理由:</span> {entry.reason}
                          </div>
                        )}
                        {entry.reviewedBy && (
                          <div className="text-white/70">
                            <span className="text-blue-400">承認者:</span> {entry.reviewedBy}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-white/50">
                        申請日時: {entry.requestedAt.toLocaleString('ja-JP')}
                        {entry.reviewedAt && (
                          <> | 承認日時: {entry.reviewedAt.toLocaleString('ja-JP')}</>
                        )}
                        <br />
                        IP: {entry.ipAddress} | {entry.userAgent}
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    {entry.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => cancelRequest(entry.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/30 rounded"
                        >
                          キャンセル
                        </button>
                      </div>
                    )}
                    
                    {entry.status === 'rejected' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => resubmitRequest(entry.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 border border-blue-400/30 rounded"
                        >
                          再申請
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredChanges.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-white/50">該当する変更履歴がありません</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ログインセッションタブ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">アクティブなログインセッション</h4>
              <button className="text-red-400 hover:text-red-300 text-sm">
                すべてのセッションを無効化
              </button>
            </div>
            
            <div className="space-y-3">
              {/* 現在のセッション */}
              <div className="glass rounded-lg p-4 border border-green-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-white font-medium">現在のセッション</h5>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        アクティブ
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-white/70">
                      <div>デバイス: Windows PC - Chrome 120.0.0.0</div>
                      <div>場所: 東京都, 日本</div>
                      <div>最終アクセス: たった今</div>
                      <div>IP: 192.168.1.100</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* その他のセッション */}
              <div className="glass rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-white font-medium">モバイルデバイス</h5>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                        非アクティブ
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-white/70">
                      <div>デバイス: iPhone - Safari 17.0</div>
                      <div>場所: 東京都, 日本</div>
                      <div>最終アクセス: 2時間前</div>
                      <div>IP: 192.168.1.101</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSessionRevoke('mobile-session-1')}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    無効化
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSecurity;