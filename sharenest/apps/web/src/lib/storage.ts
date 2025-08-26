import { getSupabase } from './supabase';

/**
 * ユーザーアバターをSupabaseストレージにアップロードする
 * @param file アップロードするファイル
 * @param userId ユーザーID
 * @returns アップロードされたファイルのパブリックURL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = getSupabase();
  
  // ファイル拡張子を取得
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  // ファイルをアップロード
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw new Error(`アバターのアップロードに失敗しました: ${error.message}`);
  }
  
  // パブリックURLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

/**
 * 古いアバターファイルを削除する
 * @param avatarUrl 削除するアバターのURL
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const supabase = getSupabase();
  
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