import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント（管理者権限）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // サービスロールキーが必要
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('🗑️ サーバーサイドでのユーザー削除開始:', userId);

    // 1. 関連データを削除（予約、レビューなど）
    console.log('📋 関連データ削除中...');
    
    // 予約データを削除
    const { error: bookingsError } = await supabaseAdmin
      .schema('sharenest')
      .from('bookings')
      .delete()
      .eq('user_id', userId);
    
    if (bookingsError) {
      console.warn('⚠️ 予約データ削除エラー:', bookingsError);
    }
    
    // レビューデータを削除
    const { error: reviewsError } = await supabaseAdmin
      .schema('sharenest')
      .from('reviews')
      .delete()
      .eq('user_id', userId);
    
    if (reviewsError) {
      console.warn('⚠️ レビューデータ削除エラー:', reviewsError);
    }
    
    // 2. プロフィールデータを削除
    console.log('👤 プロフィールデータ削除中...');
    const { error: profileError } = await supabaseAdmin
      .schema('sharenest')
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ プロフィール削除エラー:', profileError);
      return res.status(500).json({ error: 'プロフィール削除に失敗しました', details: profileError.message });
    }
    
    console.log('✅ プロフィールデータ削除成功');
    
    // 3. Supabase Authのユーザーアカウントを削除
    console.log('🔐 認証アカウント削除中...');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('❌ 認証アカウント削除エラー:', authError);
      return res.status(500).json({ error: '認証アカウント削除に失敗しました', details: authError.message });
    }
    
    console.log('✅ 認証アカウント削除成功');
    console.log('🎉 ユーザー完全削除処理完了:', userId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'ユーザーアカウントが完全に削除されました' 
    });
    
  } catch (error: any) {
    console.error('❌ ユーザー削除処理エラー:', error);
    return res.status(500).json({ 
      error: 'ユーザー削除に失敗しました', 
      details: error.message 
    });
  }
}