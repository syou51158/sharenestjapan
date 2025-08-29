import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import { supabaseBrowser } from '../lib/supabase-browser';

declare global {
  interface Window { supabase?: any }
}

if (typeof window !== 'undefined') {
  (window as any).supabase = supabaseBrowser;
  // セッション検出と自動リフレッシュの有効化
  supabaseBrowser.auth.onAuthStateChange((_event, _session) => {
    // no-op: persistSession=true でlocalStorageに保存される
  });
}

function AdminApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(AdminApp); 