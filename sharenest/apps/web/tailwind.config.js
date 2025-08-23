/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // Next.js App Router を使用する場合
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}', // 共通UIコンポーネントのパス
  ],
  theme: {
    extend: {
      // デザインガイドラインに基づいた設定を追加
      colors: {
        primary: '#FF5A5F', // 例: プライマリカラー (Airbnb風)
        secondary: '#00A699', // 例: セカンダリカラー
      },
      fontFamily: {
        // sans: ['Inter', 'sans-serif'], // 例: カスタムフォント
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
        // screens: { ... } // コンテナ幅のブレークポイント
      }
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // 必要に応じてプラグインを追加
  ],
}; 