import React, { useState, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface DocumentUpload {
  id: string;
  type: 'identity' | 'license' | 'address' | 'income';
  file: File;
  status: 'uploading' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: Date;
  rejectionReason?: string;
}

interface VerificationRequest {
  id: string;
  type: 'identity' | 'license' | 'address' | 'income';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  notes?: string;
}

const VerificationProcess: React.FC = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [activeSection, setActiveSection] = useState<'upload' | 'status' | 'history'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { key: 'identity', label: '本人確認書類', description: '運転免許証、パスポート、マイナンバーカードなど' },
    { key: 'license', label: '運転免許証', description: '有効な運転免許証の表裏' },
    { key: 'address', label: '住所確認書類', description: '公共料金の請求書、住民票など（3ヶ月以内）' },
    { key: 'income', label: '収入証明書', description: '源泉徴収票、給与明細など' }
  ];

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return;

    // ファイルサイズとタイプの検証
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください。');
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('画像ファイル（JPG、PNG）またはPDFファイルのみアップロード可能です。');
      return;
    }

    const newUpload: DocumentUpload = {
      id: Date.now().toString(),
      type: type as DocumentUpload['type'],
      file,
      status: 'uploading',
      uploadedAt: new Date()
    };

    setUploads(prev => [...prev, newUpload]);

    try {
      // ここで実際のファイルアップロード処理を行う
      // const uploadResult = await uploadDocument(file, type);
      
      // シミュレーション
      setTimeout(() => {
        setUploads(prev => prev.map(upload => 
          upload.id === newUpload.id 
            ? { ...upload, status: 'uploaded' }
            : upload
        ));
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploads(prev => prev.filter(upload => upload.id !== newUpload.id));
      alert('アップロードに失敗しました。もう一度お試しください。');
    }
  };

  const submitVerificationRequest = async (type: string) => {
    const hasUploadedDocument = uploads.some(
      upload => upload.type === type && upload.status === 'uploaded'
    );

    if (!hasUploadedDocument) {
      alert('まず書類をアップロードしてください。');
      return;
    }

    const newRequest: VerificationRequest = {
      id: Date.now().toString(),
      type: type as VerificationRequest['type'],
      status: 'pending',
      submittedAt: new Date()
    };

    setRequests(prev => [...prev, newRequest]);

    try {
      // ここで実際の認証申請処理を行う
      // await submitVerification(type);
      
      alert('認証申請を送信しました。審査には1-3営業日かかります。');
    } catch (error) {
      console.error('Verification request failed:', error);
      setRequests(prev => prev.filter(request => request.id !== newRequest.id));
      alert('申請の送信に失敗しました。もう一度お試しください。');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'uploaded': return 'text-green-600';
      case 'verified': return 'text-green-700';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'in_review': return 'text-blue-600';
      case 'approved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'アップロード中';
      case 'uploaded': return 'アップロード完了';
      case 'verified': return '認証済み';
      case 'rejected': return '却下';
      case 'pending': return '審査待ち';
      case 'in_review': return '審査中';
      case 'approved': return '承認済み';
      default: return '不明';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">認証プロセス管理</h2>
          <p className="text-sm text-gray-600 mt-1">
            本人確認や各種認証の申請・管理を行います
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'upload', label: '書類アップロード' },
              { key: 'status', label: '認証状況' },
              { key: 'history', label: '申請履歴' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          {/* 書類アップロードセクション */}
          {activeSection === 'upload' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">アップロード時の注意事項</h3>
                    <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                      <li>ファイルサイズは10MB以下にしてください</li>
                      <li>画像ファイル（JPG、PNG）またはPDFファイルのみ対応</li>
                      <li>文字や写真が鮮明に写っているものをアップロードしてください</li>
                      <li>個人情報が含まれるため、安全な環境でアップロードしてください</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentTypes.map((docType) => {
                  const hasUpload = uploads.some(upload => upload.type === docType.key);
                  const latestUpload = uploads.filter(upload => upload.type === docType.key).pop();
                  
                  return (
                    <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{docType.label}</h3>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                        {hasUpload && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            latestUpload?.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                            latestUpload?.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(latestUpload?.status || '')}
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(docType.key, file);
                          }
                        }}
                      />

                      <div className="space-y-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={latestUpload?.status === 'uploading'}
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {hasUpload ? 'ファイルを再アップロード' : 'ファイルを選択'}
                        </button>

                        {hasUpload && latestUpload?.status === 'uploaded' && (
                          <button
                            onClick={() => submitVerificationRequest(docType.key)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            認証申請を送信
                          </button>
                        )}
                      </div>

                      {latestUpload && (
                        <div className="mt-3 text-xs text-gray-500">
                          アップロード日時: {latestUpload.uploadedAt.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 認証状況セクション */}
          {activeSection === 'status' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {documentTypes.map((docType) => {
                  const latestRequest = requests.filter(req => req.type === docType.key).pop();
                  const hasUpload = uploads.some(upload => upload.type === docType.key && upload.status === 'uploaded');
                  
                  return (
                    <div key={docType.key} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{docType.label}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">書類:</span>
                          <span className={`text-sm font-medium ${
                            hasUpload ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {hasUpload ? 'アップロード済み' : '未アップロード'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">認証:</span>
                          <span className={`text-sm font-medium ${
                            latestRequest ? getStatusColor(latestRequest.status) : 'text-gray-400'
                          }`}>
                            {latestRequest ? getStatusText(latestRequest.status) : '未申請'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {requests.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">進行中の認証申請</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {requests.filter(req => req.status !== 'approved').map((request) => (
                      <div key={request.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {documentTypes.find(type => type.key === request.type)?.label}
                            </h4>
                            <p className="text-sm text-gray-600">
                              申請日: {request.submittedAt.toLocaleDateString()}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                備考: {request.notes}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 申請履歴セクション */}
          {activeSection === 'history' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">申請履歴がありません</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">全申請履歴</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <div key={request.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {documentTypes.find(type => type.key === request.type)?.label}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
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
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationProcess;