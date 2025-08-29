import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'owner' | 'user';
type KYCStatus = 'pending' | 'approved' | 'rejected';

// JSONBフィールドの型定義
type AddressInfo = {
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
};

type EmergencyContactInfo = {
  name?: string;
  phone?: string;
  relationship?: string;
};

type DriverLicenseInfo = {
  license_no?: string;
  status?: 'pending' | 'verified' | 'rejected';
  expiry_date?: string;
  issued_date?: string;
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kyc_status: KYCStatus;
  is_verified: boolean;
  // Common optional fields used across app pages
  phone?: string;
  avatar?: string;
  // Additional profile fields (optional to match DB columns and UI usage)
  license_number?: string;
  license_expiry?: string;
  address?: string | AddressInfo; // 文字列またはJSONB構造
  birth_date?: string;
  emergency_contact?: string | EmergencyContactInfo; // 文字列またはJSONB構造
  emergency_phone?: string;
  driver_license?: DriverLicenseInfo; // JSONB構造
  is_owner?: boolean;
  member_since?: string;
  total_bookings?: number;
  total_spent?: number;
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isVerified: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserStats: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  // 追加
  profileLoading: boolean;
  profileError: string | null;
  createProfile: (input?: { name?: string; email?: string }) => Promise<void>;
  deleteUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // 追加: プロフィールのローディング/エラー、作成中フラグ
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;
    console.log('🔐 AuthProvider初期化開始');
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📋 初期セッション取得:', { session: !!session, error });
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ セッション取得エラー:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('👤 初期ユーザー設定:', session.user.id);
          setUser(session.user);
          setAccessToken(session.access_token);
          setLoading(false); // ユーザー設定後すぐにローディング終了
          // プロフィール取得を並行実行
          fetchUserProfile(session.user.id).catch(console.error);
        } else {
          // セッションがない場合は即座にローディング終了
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ 認証初期化エラー:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 認証状態変更:', event, session?.user?.id || '未ログイン');
      console.log('📍 現在のURL:', window.location.href);
      console.log('🔗 セッション詳細:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email
      });
      
      if (!isMounted) {
        console.log('⚠️ コンポーネントがアンマウント済み - 処理をスキップ');
        return;
      }
      
      // 状態を即座に更新
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      
      // ログアウト時は即座にプロフィールをクリア
      if (event === 'SIGNED_OUT') {
        console.log('🚪 ログアウト検知 - プロフィールクリア');
        setUserProfile(null);
        return;
      }
      
      if (session?.user) {
        console.log('👤 ユーザーセッション確認済み - プロフィール処理開始');
        
        // 新規ユーザーの場合、プロフィールを作成
        if (event === 'SIGNED_IN') {
          console.log('🆕 新規ログイン検知 - 既存ユーザーチェック');
          const { data: existingUser } = await supabase
            .schema('sharenest')
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          if (!existingUser) {
            console.log('🆕 新規ユーザー - プロフィール作成開始');
            try {
              await createUserProfile(session.user);
            } catch (error) {
              console.error('❌ プロフィール作成エラー:', error);
            }
          } else {
            console.log('✅ 既存ユーザー確認済み');
          }
        }
        
        // プロフィール取得をバックグラウンドで実行
        fetchUserProfile(session.user.id).catch((err) => {
          console.error('❌ 認証状態変更時のプロフィール取得失敗:', err);
        });
      } else {
        console.log('❌ セッションにユーザー情報なし');
        setUserProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []); // supabaseは依存配列から削除（キャッシュされたクライアントなので変更されない）

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      console.log('📋 ユーザープロフィール取得開始:', userId);
      const { data, error } = await supabase
        .schema('sharenest')
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.log('📊 プロフィールエラー:', (error as any).code, (error as any).message);

        if ((error as any).code === 'PGRST116') {
          console.log('🆕 プロフィールが存在しないため作成します');
          if (user && !isCreatingProfile) {
            try {
              setIsCreatingProfile(true);
              await createUserProfile(user);
            } catch (createError: any) {
              console.error('❌ プロフィール作成エラー:', createError);
              setProfileError(createError?.message || 'プロフィール作成に失敗しました');
            } finally {
              setIsCreatingProfile(false);
            }
          }
          return;
        }

        // ここでは仮プロフィールは設定しない（権限やRLS問題の早期検知のため）
        throw error;
      }

      console.log('✅ プロフィール取得成功:', (data as any)?.name);

      // Google認証の場合、プロフィール画像を自動更新（ただし、アバターが未設定(null)の場合のみ）
      if (user?.user_metadata?.avatar_url && data?.avatar === null) {
        try {
          console.log('🖼️ Googleアバターを初期設定:', user.user_metadata.avatar_url);
          const { error: updateError } = await supabase
            .schema('sharenest')
            .from('users')
            .update({ 
              avatar: user.user_metadata.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (!updateError) {
            (data as any).avatar = user.user_metadata.avatar_url;
          }
        } catch (updateError) {
          console.warn('⚠️ アバター更新エラー:', updateError);
        }
      }
      
      setUserProfile(data as any);
    } catch (err: any) {
      console.error('❌ プロフィール取得エラー:', err);
      setProfileError(err?.message || 'プロフィール取得に失敗しました');
      // エラー時もプロフィールをnullにして続行
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Googleログイン開始');
    console.log('🌐 リダイレクトURL:', `${window.location.origin}/app/vehicles`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account'
        },
        redirectTo: `${window.location.origin}/app/vehicles`
      }
    });
    
    console.log('📊 Googleログイン結果:', { data, error });
    
    if (error) {
      console.error('❌ Googleログインエラー:', error);
      throw error;
    }
    
    console.log('✅ Googleログイン成功 - リダイレクト中...');
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await createUserProfile(data.user, name, email);
    }
  };

  const createUserProfile = async (user: User, name?: string, email?: string) => {
    const userEmail = email || user.email || '';
    const userName = name || user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;

    console.log('👤 Creating user profile:', {
      id: user.id,
      email: userEmail,
      name: userName,
      avatar: avatarUrl
    });

    try {
      setProfileLoading(true);
      setProfileError(null);
      console.log('🆕 新規ユーザープロフィール作成:', user.id);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('プロフィール作成タイムアウト')), 4000)
      );
      
      const newProfile = {
        id: user.id,
        email: userEmail,
        name: userName,
        avatar: avatarUrl,
        role: 'user',
        kyc_status: 'pending',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await Promise.race([
        supabase
          .schema('sharenest')
          .from('users')
          .insert([newProfile])
          .select()
          .maybeSingle(),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ プロフィール作成エラー:', error);
        // 仮プロフィールは設定しない（本来のロール/権限が不明になるため）
        throw error;
      }
      
      console.log('✅ プロフィール作成成功');
      setUserProfile(data);
      
    } catch (err: any) {
      console.error('❌ プロフィール作成エラー:', err);
      setProfileError(err?.message || 'プロフィール作成に失敗しました');
      // 失敗時はnullのまま（UI側で再試行/エラー表示）
    } finally {
      setProfileLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 ログアウト処理開始...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ ログアウトエラー:', error);
        throw error;
      }
      console.log('✅ ログアウト成功');
      // 状態を明示的にクリア
      setUser(null);
      setUserProfile(null);
      setAccessToken(null);
    } catch (error) {
      console.error('❌ ログアウト処理でエラー:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    setProfileLoading(true);
    setProfileError(null);
    
    // JSONBフィールドの処理
    const processedUpdates = { ...updates } as Record<string, any>;

    // 日付/日付時刻フィールドの空文字をnullへ正規化（DBでdate/ timestamptzの空文字はエラーになるため）
    const dateLikeFields = [
      'license_expiry',
      'birth_date',
      'member_since',
      'created_at',
      'updated_at',
      // JSONB内の日付はここでは対象外（driver_license.expiry_dateなどはJSONBとして扱う）
    ];
    for (const field of dateLikeFields) {
      if (processedUpdates[field] === '') {
        processedUpdates[field] = null;
      }
    }
    
    // addressフィールドの処理
    if (updates.address !== undefined) {
      if (typeof updates.address === 'object' && updates.address !== null) {
        // AddressInfo型の場合はJSONBとして保存
        processedUpdates.address = updates.address as any;
      } else {
        // 文字列の場合はそのまま保存（後方互換性）
        processedUpdates.address = updates.address;
      }
    }
    
    // emergency_contactフィールドの処理
    if (updates.emergency_contact !== undefined) {
      if (typeof updates.emergency_contact === 'object' && updates.emergency_contact !== null) {
        // EmergencyContactInfo型の場合はJSONBとして保存
        processedUpdates.emergency_contact = updates.emergency_contact as any;
      } else {
        // 文字列の場合はそのまま保存（後方互換性）
        processedUpdates.emergency_contact = updates.emergency_contact;
      }
    }
    
    // driver_licenseフィールドの処理
    if (updates.driver_license !== undefined) {
      processedUpdates.driver_license = updates.driver_license as any;
    }
    
    const { error } = await supabase
      .schema('sharenest')
      .from('users')
      .update({ ...processedUpdates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (error) {
      setProfileLoading(false);
      setProfileError((error as any)?.message || 'プロフィール更新に失敗しました');
      throw error;
    }
    
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    setProfileLoading(false);
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    setProfileError(null);
    await fetchUserProfile(user.id);
  };

  const calculateUserStats = async (userId: string) => {
    try {
      console.log('📊 ユーザー統計情報計算開始:', userId);
      
      // 予約数と総支払額を計算
      const { data: bookings, error: bookingsError } = await supabase
        .schema('sharenest')
        .from('bookings')
        .select('total_amount, status')
        .eq('user_id', userId);
      
      if (bookingsError) {
        console.error('❌ 予約データ取得エラー:', bookingsError);
        return null;
      }
      
      // レビュー数と平均評価を計算
      const { data: reviews, error: reviewsError } = await supabase
        .schema('sharenest')
        .from('reviews')
        .select('rating')
        .eq('user_id', userId);
      
      if (reviewsError) {
        console.error('❌ レビューデータ取得エラー:', reviewsError);
        return null;
      }
      
      const totalBookings = bookings?.length || 0;
      const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const reviewsCount = reviews?.length || 0;
      const averageRating = reviewsCount > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsCount 
        : 0;
      
      const stats = {
        total_bookings: totalBookings,
        total_spent: totalSpent,
        rating: Math.round(averageRating * 10) / 10, // 小数点第1位まで
        reviews_count: reviewsCount
      };
      
      console.log('✅ 統計情報計算完了:', stats);
      
      // データベースに統計情報を更新
      const { error: updateError } = await supabase
        .schema('sharenest')
        .from('users')
        .update({
          ...stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ 統計情報更新エラー:', updateError);
        return stats; // 計算結果は返す
      }
      
      console.log('✅ 統計情報データベース更新完了');
      return stats;
      
    } catch (error) {
      console.error('❌ 統計情報計算エラー:', error);
      return null;
    }
  };

  const updateUserStats = async () => {
    if (!user) return;
    const stats = await calculateUserStats(user.id);
    if (stats && userProfile) {
      setUserProfile(prev => prev ? { ...prev, ...stats } : null);
    }
  };

  // 追加: 明示的にプロフィール作成をトリガーするAPI（UIから呼び出し可能）
  const createProfile = async (input?: { name?: string; email?: string }) => {
    if (!user) throw new Error('User not authenticated');
    if (isCreatingProfile) return; // 二重起動防止
    setIsCreatingProfile(true);
    setProfileError(null);
    try {
      await createUserProfile(user, input?.name, input?.email);
    } catch (err: any) {
      setProfileError(err?.message || 'プロフィール作成に失敗しました');
      throw err;
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const deleteUserProfile = async () => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      console.log('🗑️ アカウント完全削除処理開始:', user.id);
      
      // サーバーサイドAPIを呼び出してユーザーアカウントを完全削除
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ サーバーサイド削除エラー:', result);
        throw new Error(result.error || 'アカウント削除に失敗しました');
      }
      
      console.log('✅ サーバーサイド削除成功:', result.message);
      
      // ローカル状態をクリア
      setUserProfile(null);
      setUser(null);
      setAccessToken(null);
      
      console.log('🎉 アカウント完全削除処理完了');
      
    } catch (err: any) {
      console.error('❌ アカウント削除処理エラー:', err);
      setProfileError(err?.message || 'アカウント削除に失敗しました');
      throw err;
    } finally {
      setProfileLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userProfile) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'user': 1,
      'owner': 2,
      'admin': 3
    };
    
    return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = userProfile?.role === 'admin';
  const isOwner = userProfile?.role === 'owner' || isAdmin;
  const isVerified = userProfile?.is_verified || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      isAdmin, 
      isOwner, 
      isVerified,
      accessToken,
      signIn,
      signInWithGoogle, 
      signUp, 
      signOut,
      updateUserProfile,
      refreshUserProfile,
      updateUserStats,
      hasPermission,
      // 追加
      profileLoading,
      profileError,
      createProfile,
      deleteUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}




