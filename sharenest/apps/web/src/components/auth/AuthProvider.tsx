import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'owner' | 'user';
type KYCStatus = 'pending' | 'approved' | 'rejected';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kyc_status: KYCStatus;
  is_verified: boolean;
  phone?: string;
  avatar?: string;
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
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    // 初回アクセス時の現在のセッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // プロフィール取得の完了を待たずに開始し、UIのloadingは解除する
          // これによりネットワーク遅延や失敗時でもヘッダーがスピナーのままにならない
          fetchUserProfile(session.user.id).catch((err) => {
            console.error('Deferred profile fetch failed:', err);
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        // 初期化完了後、即座にloadingを解除
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // 新規ユーザーの場合、プロフィールを作成
        if (event === 'SIGNED_IN') {
          const { data: existingUser } = await supabase
            .schema('sharenest')
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          if (!existingUser) {
            try {
              await createUserProfile(session.user);
            } catch (error) {
              console.error('Error creating user profile:', error);
            }
          }
        }
        
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 Fetching user profile for:', userId);
    console.log('📧 User email:', user?.email);
    console.log('🖼️ Google avatar URL:', user?.user_metadata?.avatar_url);
    
    // 認証状態の詳細確認
    const session = await supabase.auth.getSession();
    console.log('🔐 Current session:', {
      hasSession: !!session.data.session,
      userId: session.data.session?.user?.id,
      accessToken: session.data.session?.access_token ? 'present' : 'missing',
      tokenType: session.data.session?.token_type
    });
    
    try {
      // リクエスト前にSupabaseクライアントの状態を確認
      console.log('🌐 Supabase client config:', {
        url: supabase.supabaseUrl,
        schema: 'sharenest',
        hasAuth: !!supabase.auth
      });
      
      const { data, error } = await supabase
        .schema('sharenest')
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        if (error.code === 'PGRST116') {
          // ユーザープロフィールが存在しない場合は作成
          console.log('👤 User profile not found, creating new profile...');
          if (user) {
            await createUserProfile(user);
          }
          return;
        }
        throw error;
      }
      
      console.log('📊 Current database avatar:', data?.avatar);
      
      // Google認証の場合、プロフィール画像を自動更新
      if (user?.user_metadata?.avatar_url && (!data.avatar || data.avatar !== user.user_metadata.avatar_url)) {
        console.log('🔄 Avatar update needed. Updating from Google URL...');
        const { error: updateError } = await supabase
          .schema('sharenest')
          .from('users')
          .update({ 
            avatar: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (!updateError) {
          data.avatar = user.user_metadata.avatar_url;
          console.log('✅ Avatar updated successfully!');
        } else {
          console.error('❌ Failed to update avatar:', updateError);
        }
      } else {
        console.log('ℹ️ No avatar update needed');
      }
      
      setUserProfile(data);
    } catch (err) {
      console.error('💥 Unexpected error in fetchUserProfile:', err);
      // エラーが発生してもアプリを停止させない
      setUserProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account'
        },
        redirectTo: `${window.location.origin}/app/vehicles`
      }
    });
    if (error) throw error;
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
      const { error: profileError } = await supabase
        .schema('sharenest')
        .from('users')
        .insert({ 
          id: user.id, 
          email: userEmail, 
          name: userName, 
          avatar: avatarUrl,
          role: 'user', 
          kyc_status: 'pending',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('❌ Error creating user profile:', profileError);
        throw profileError;
      }
      
      console.log('✅ User profile created successfully!');
      
      // プロフィール作成後、再度フェッチ
      await fetchUserProfile(user.id);
    } catch (err) {
      console.error('💥 Unexpected error in createUserProfile:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .schema('sharenest')
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (error) throw error;
    
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
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
      signIn,
      signInWithGoogle, 
      signUp, 
      signOut,
      updateUserProfile,
      refreshUserProfile,
      hasPermission
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



