import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../components/auth/AuthProvider';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, name);
      alert('登録完了！メールを確認してください。');
      router.push('/app/login');
    } catch (error: any) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 動的背景 */}
      <div className="fixed inset-0 animated-bg opacity-90 -z-10"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20 -z-10"></div>
      
      {/* フローティング要素 */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
      
      <div className="max-w-md w-full space-y-8 glass rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-center text-4xl font-black gradient-text-cyber mb-2">新規登録</h2>
          <p className="text-xl text-white/80 font-light">京都・大阪のプレミアムカーシェア</p>
          <p className="mt-4 text-center text-sm text-white/70">
            既にアカウントをお持ちの方は{' '}
            <Link href="/app/login" className="font-medium text-cyan-300 hover:text-cyan-200 transition-colors">
              ログイン
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">お名前</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="山田太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">メールアドレス</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">パスワード</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  登録中...
                </span>
              ) : (
                '新規登録'
              )}
            </button>
          </div>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60">または</span>
            </div>
          </div>

          {/* Googleログインボタン */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-white/20 text-lg font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













