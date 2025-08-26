import { getSupabaseForStorage } from './supabase';

/**
 * ユーザーアバターをSupabaseストレージにアップロードする
 * @param file アップロードするファイル
 * @param userId ユーザーID
 * @returns アップロードされたファイルのパブリックURL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = getSupabaseForStorage();
  
  // ファイル拡張子を取得
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  console.log('🔄 アバターアップロード開始:', { 
    fileName, 
    fileSize: file.size, 
    fileType: file.type,
    fileExtension: fileExt,
    originalName: file.name
  });
  
  // ファイルの内容を確認（デバッグ用）
  console.log('📁 ファイル詳細:', {
    lastModified: file.lastModified,
    webkitRelativePath: file.webkitRelativePath,
    constructor: file.constructor.name
  });
  
  // アップロードオプションを詳細ログ
  const uploadOptions = {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream' // 正しいMIMEタイプを明示的に設定
  };
  
  // ファイルタイプが正しく設定されているか確認
  if (!file.type) {
    console.warn('⚠️ ファイルタイプが検出されませんでした:', file.name);
  } else {
    console.log('✅ ファイルタイプ検出:', file.type);
  }
  
  console.log('⚙️ アップロードオプション:', uploadOptions);
  
  // ファイルをアップロード
  console.log('🚀 アップロード実行中...', {
    bucketName: 'avatars',
    fileName,
    fileInstance: file,
    uploadOptions
  });
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, uploadOptions);
  
  if (error) {
    console.error('❌ アバターアップロードエラー:', error);
    console.error('❌ エラー詳細:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
    throw new Error(`アバターのアップロードに失敗しました: ${error.message}`);
  }
  
  console.log('✅ アバターアップロード成功:', data);
  console.log('✅ アップロード結果詳細:', {
    path: data?.path,
    id: data?.id,
    fullPath: data?.fullPath
  });
  
  // パブリックURLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  console.log('🔗 パブリックURL取得:', publicUrl);
  
  return publicUrl;
}

/**
 * 古いアバターファイルを削除する
 * @param avatarUrl 削除するアバターのURL
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const supabase = getSupabaseForStorage();
  
  // URLからファイル名を抽出
  const fileName = avatarUrl.split('/').pop();
  if (!fileName) return;
  
  const { error } = await supabase.storage
    .from('avatars')
    .remove([fileName]);
  
  if (error) {
    console.error('アバター削除エラー:', error.message);
  }
}

/**
 * ファイルサイズとタイプを検証する
 * @param file 検証するファイル
 * @param maxSizeMB 最大ファイルサイズ（MB）
 * @returns 検証結果
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
  // ファイルサイズチェック
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `ファイルサイズは${maxSizeMB}MB以下にしてください。`
    };
  }
  
  // ファイルタイプチェック
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPEG、PNG、GIF、WebP形式の画像ファイルのみアップロード可能です。'
    };
  }
  
  return { isValid: true };
}