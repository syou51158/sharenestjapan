import React, { useState, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface AuthStatusProps {
  userProfile: any;
  onUpdateProfile: (updates: any) => Promise<void>;
}

interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: VerificationStatus;
  icon: string;
  requiredFields?: string[];
  documents?: string[];
}

interface DocumentUpload {
  id: string;
  type: string;
  file: File;
  status: 'uploading' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: Date;
  rejectionReason?: string;
}

interface VerificationRequest {
  id: string;
  type: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  notes?: string;
}

const AuthStatusManager: React.FC<AuthStatusProps> = ({ userProfile, onUpdateProfile }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'upload' | 'history'>('status');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 認証項目の定義
  const verificationItems: VerificationItem[] = [
    {
      id: 'email',
      title: 'メールアドレス認証',
      description: 'アカウントのメールアドレスが確認済みです',
      status: user?.email_confirmed_at ? 'verified' : 'unverified',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      id: 'phone',
      title: '電話番号認証',
      description: '電話番号の確認が完了しています',
      status: userProfile?.phone_verified ? 'verified' : 'unverified',
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      requiredFields: ['phone']
    },
    {
      id: 'identity',
      title: '本人確認',
      description: '身分証明書による本人確認が完了しています',
      status: userProfile?.identity_verified ? 'verified' : 'unverified',
      icon: 'M10 2L3 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-7-5z',
      documents: ['身分証明書（運転免許証、パスポート、マイナンバーカードなど）']
    },
    {
      id: 'license',
      title: '運転免許証認証',
      description: '運転免許証の確認が完了しています',
      status: userProfile?.license_verified ? 'verified' : userProfile?.license_number ? 'pending' : 'unverified',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      requiredFields: ['license_number', 'license_expiry'],
      documents: ['運転免許証の表面', '運転免許証の裏面']
    },
    {
      id: 'address',
      title: '住所確認',
      description: '現住所の確認が完了しています',
      status: userProfile?.address_verified ? 'verified' : userProfile?.address ? 'pending' : 'unverified',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      requiredFields: ['address'],
      documents: ['住民票または公共料金の請求書（3ヶ月以内）']
    }
  ];

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return '認証済み';
      case 'pending': return '審査中';
      case 'rejected': return '認証失敗';
      default: return '未認証';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return 'M5 13l4 4L19 7';
      case 'pending': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'rejected': return 'M6 18L18 6M6 6l12 12';
      default: return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
    }
  };

  const handleDocumentUpload = async (verificationId: string, file: File) => {
    setIsUploading(true);
    
    // ファイルサイズとタイプの検証
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください。');
      setIsUploading(false);
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('画像ファイル（JPG、PNG）またはPDFファイルのみアップロード可能です。');
      setIsUploading(false);
      return;
    }

    const newUpload: DocumentUpload = {
      id: Date.now().toString(),
      type: verificationId,
      file,
      status: 'uploading',
      uploadedAt: new Date()
    };

    setUploads(prev => [...prev, newUpload]);
    
    try {
      // TODO: 実際のファイルアップロード処理を実装
      console.log(`Uploading document for ${verificationId}:`, file.name);
      
      // 仮の処理 - 実際にはSupabaseストレージにアップロード
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // アップロード完了状態に更新
      setUploads(prev => prev.map(upload => 
        upload.id === newUpload.id 
          ? { ...upload, status: 'uploaded' }
          : upload
      ));
      
      // 認証状態を「審査中」に更新
      if (verificationId === 'license') {
        const current = (userProfile?.driver_license as any) || {};
        await onUpdateProfile({ driver_license: { ...current, status: 'pending' } });
      } else {
        const updateField = `${verificationId}_verification_status`;
        await onUpdateProfile({ [updateField]: 'pending' });
      }
      
      alert('書類がアップロードされました。審査には1-3営業日かかります。');
    } catch (error) {
      console.error('Document upload error:', error);
      setUploads(prev => prev.filter(upload => upload.id !== newUpload.id));
      alert('書類のアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerificationRequest = async (verificationId: string) => {
    const item = verificationItems.find(item => item.id === verificationId);
    if (!item) return;

    // 必須フィールドのチェック
    if (item.requiredFields) {
      const missingFields = item.requiredFields.filter(field => !userProfile?.[field]);
      if (missingFields.length > 0) {
        alert(`以下の情報を先に入力してください: ${missingFields.join(', ')}`);
        return;
      }
    }

    // 書類がアップロードされているかチェック
    const hasUploadedDocument = uploads.some(
      upload => upload.type === verificationId && upload.status === 'uploaded'
    );

    if (item.documents && !hasUploadedDocument) {
      alert('まず必要書類をアップロードしてください。');
      return;
    }

    const newRequest: VerificationRequest = {
      id: Date.now().toString(),
      type: verificationId,
      status: 'pending',
      submittedAt: new Date()
    };

    setRequests(prev => [...prev, newRequest]);

    try {
      // 認証リクエストの送信
      if (verificationId === 'license') {
        const current = (userProfile?.driver_license as any) || {};
        await onUpdateProfile({ driver_license: { ...current, status: 'pending' } });
      } else {
        const updateField = `${verificationId}_verification_requested`;
        await onUpdateProfile({ [updateField]: true });
      }
      
      alert('認証申請を送信しました。審査には1-3営業日かかります。');
    } catch (error) {
      console.error('Verification request error:', error);
      setRequests(prev => prev.filter(request => request.id !== newRequest.id));
      alert('認証リクエストの送信に失敗しました。');
    }
  };

  const handleFileSelect = (verificationId: string) => {
    setSelectedDocument(verificationId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDocument) {
      handleDocumentUpload(selectedDocument, file);
    }
    setSelectedDocument(null);
  };

  const getUploadStatus = (verificationId: string) => {
    const latestUpload = uploads.filter(upload => upload.type === verificationId).pop();
    return latestUpload;
  };

  const getRequestStatus = (verificationId: string) => {
    const latestRequest = requests.filter(req => req.type === verificationId).pop();
    return latestRequest;
  };


  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          認証状況管理
        </h3>

        {/* タブナビゲーション */}
        <div className="flex space-x-1 mb-6 glass rounded-lg p-1">
          {[
            { key: 'status', label: '認証状況', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { key: 'upload', label: '書類アップロード', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
            { key: 'history', label: '申請履歴', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 隠しファイル入力 */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        
        {/* 認証状況タブ */}
        {activeTab === 'status' && (
          <div className="grid gap-4">
            {verificationItems.map((item) => {
              const uploadStatus = getUploadStatus(item.id);
              const requestStatus = getRequestStatus(item.id);
              
              return (
                <div key={item.id} className="glass rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <p className="text-white/70 text-sm mt-1">{item.description}</p>
                        
                        {/* アップロード状況 */}
                        {uploadStatus && (
                          <div className="mt-2">
                            <p className="text-white/60 text-xs">書類状況:</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                              uploadStatus.status === 'uploaded' ? 'bg-green-500/20 text-green-300' :
                              uploadStatus.status === 'uploading' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {uploadStatus.status === 'uploaded' ? 'アップロード完了' :
                               uploadStatus.status === 'uploading' ? 'アップロード中' : 'アップロード済み'}
                            </span>
                          </div>
                        )}
                        
                        {/* 申請状況 */}
                        {requestStatus && (
                          <div className="mt-2">
                            <p className="text-white/60 text-xs">申請状況:</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                              requestStatus.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                              requestStatus.status === 'in_review' ? 'bg-blue-500/20 text-blue-300' :
                              requestStatus.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {requestStatus.status === 'approved' ? '承認済み' :
                               requestStatus.status === 'in_review' ? '審査中' :
                               requestStatus.status === 'pending' ? '審査待ち' : '却下'}
                            </span>
                          </div>
                        )}
                        
                        {/* 必須フィールドの表示 */}
                        {item.requiredFields && (
                          <div className="mt-2">
                            <p className="text-white/60 text-xs">必須情報:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.requiredFields.map((field) => {
                                const hasValue = userProfile?.[field];
                                return (
                                  <span
                                    key={field}
                                    className={`px-2 py-1 rounded text-xs ${
                                      hasValue ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    }`}
                                  >
                                    {field}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* ステータス表示 */}
                      <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(item.status)} />
                        </svg>
                        {getStatusText(item.status)}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 書類アップロードタブ */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* アップロード注意事項 */}
            <div className="glass rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-300">アップロード時の注意事項</h3>
                  <ul className="text-sm text-white/70 mt-1 list-disc list-inside space-y-1">
                    <li>ファイルサイズは10MB以下にしてください</li>
                    <li>画像ファイル（JPG、PNG）またはPDFファイルのみ対応</li>
                    <li>文字や写真が鮮明に写っているものをアップロードしてください</li>
                    <li>個人情報が含まれるため、安全な環境でアップロードしてください</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verificationItems.filter(item => item.documents).map((item) => {
                const uploadStatus = getUploadStatus(item.id);
                const requestStatus = getRequestStatus(item.id);
                
                return (
                  <div key={item.id} className="glass rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-white/70">{item.description}</p>
                        {item.documents && (
                          <div className="mt-2">
                            <p className="text-white/60 text-xs">必要書類:</p>
                            <ul className="text-white/70 text-xs mt-1 space-y-1">
                              {item.documents.map((doc, index) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1 h-1 bg-white/50 rounded-full mr-2"></span>
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {uploadStatus && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          uploadStatus.status === 'uploaded' ? 'bg-green-500/20 text-green-300' :
                          uploadStatus.status === 'uploading' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {uploadStatus.status === 'uploaded' ? 'アップロード完了' :
                           uploadStatus.status === 'uploading' ? 'アップロード中' : 'アップロード済み'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleFileSelect(item.id)}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center px-4 py-2 glass border border-white/20 rounded-md text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {uploadStatus ? 'ファイルを再アップロード' : 'ファイルを選択'}
                      </button>

                      {uploadStatus?.status === 'uploaded' && !requestStatus && (
                        <button
                          onClick={() => handleVerificationRequest(item.id)}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          認証申請を送信
                        </button>
                      )}
                    </div>

                    {uploadStatus && (
                      <div className="mt-3 text-xs text-white/50">
                        アップロード日時: {uploadStatus.uploadedAt.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 申請履歴タブ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-white/50">申請履歴がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => {
                  const item = verificationItems.find(item => item.id === request.type);
                  return (
                    <div key={request.id} className="glass rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">
                            {item?.title || request.type}
                          </h4>
                          <div className="text-sm text-white/70 space-y-1">
                            <p>申請日: {request.submittedAt.toLocaleDateString()}</p>
                            {request.reviewedAt && (
                              <p>審査完了日: {request.reviewedAt.toLocaleDateString()}</p>
                            )}
                            {request.notes && (
                              <p>備考: {request.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          request.status === 'in_review' ? 'bg-blue-500/20 text-blue-300' :
                          request.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {request.status === 'pending' ? '審査待ち' :
                           request.status === 'in_review' ? '審査中' :
                           request.status === 'approved' ? '承認済み' : '却下'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* 全体の認証進捗 */}
        <div className="mt-6 p-4 glass rounded-lg border border-white/10">
          <h4 className="text-white font-medium mb-3">認証進捗</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>完了済み</span>
                <span>{verificationItems.filter(item => item.status === 'verified').length}/{verificationItems.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(verificationItems.filter(item => item.status === 'verified').length / verificationItems.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {Math.round((verificationItems.filter(item => item.status === 'verified').length / verificationItems.length) * 100)}%
              </div>
              <div className="text-xs text-white/70">完了</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusManager;