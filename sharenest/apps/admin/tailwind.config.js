/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/app/**/*.{js,ts,jsx,tsx,mdx}', // App Router を使用する場合
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}', // 共通UIコンポーネントのパス
  ],
  theme: {
    extend: {
      // 管理画面特有のデザインガイドラインに基づいた設定を追加
      colors: {
        primary: '#1890ff', // 例: Ant Design 風プライマリカラー
        // secondary: '...',
      },
    },
  },
  plugins: [],
}; 