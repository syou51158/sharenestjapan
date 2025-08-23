# ShareNest

ShareNest は、車のオーナーと利用者を繋ぐカーシェアリングプラットフォームです。

## プロジェクト概要

このリポジトリは、ShareNest の Web 会員サイト、管理者ダッシュボード、モバイルアプリ、およびそれらを支えるバックエンド API、データベーススキーマ、共通 UI コンポーネントを含みます。

主な技術スタック:

*   **Web 会員サイト (`apps/web`):** Next.js, React, TypeScript, Tailwind CSS
*   **管理画面 (`apps/admin`):** Next.js, React, TypeScript, Tailwind CSS
*   **モバイルアプリ (`apps/mobile`):** Expo (React Native), TypeScript
*   **API (`packages/api`):** tRPC, Zod
*   **データベース (`packages/db`):** Prisma
*   **共通 UI (`packages/ui`):** React, TypeScript, Storybook (予定)
*   **設定 (`packages/config`):** ESLint, Prettier, tsconfig
*   **インフラ (`infrastructure`):** Terraform (予定)
*   **ドキュメント (`docs`):** 仕様書、ER 図、API ドキュメント

## 開発環境構築

### 前提条件

*   Node.js (バージョンは `package.json` の `engines` フィールドまたは `.nvmrc` を参照)
*   pnpm (プロジェクトルートの `package.json` の `packageManager` フィールドを参照)

### セットアップ手順

1.  リポジトリをクローンします:
    ```bash
    git clone <repository-url>
    cd sharenest
    ```

2.  依存関係をインストールします:
    ```bash
    pnpm install
    ```

3.  環境変数ファイルを作成します。各アプリケーション/パッケージの `.env.example` を参考に `.env` ファイルを作成してください。

4.  データベースをマイグレーションします (初回):
    ```bash
    pnpm --filter db dev:migrate
    ```

### 開発サーバーの起動

*   **Web 会員サイト:**
    ```bash
    pnpm --filter web dev
    ```
*   **管理画面:**
    ```bash
    pnpm --filter admin dev
    ```
*   **モバイルアプリ (Expo Go):**
    ```bash
    pnpm --filter mobile dev
    ```
*   **API (tRPC スタンドアロンサーバー - 開発用):**
    (通常は Next.js アプリケーションに統合されますが、必要に応じてスタンドアロンで起動できます)

## コーディング規約

*   `packages/config/eslint-preset.js` に基づく ESLint
*   `packages/config/prettier-config.js` に基づく Prettier
*   コミットメッセージ規約: Conventional Commits
*   ブランチ命名ルール: `feature/issue-123-description` や `fix/bug-name` など

## 多言語対応

*   Web アプリケーションでは `next-i18next` (または同様のライブラリ) を使用し、日本語、英語、中国語に対応します。
*   翻訳ファイルは各アプリケーションの適切なディレクトリ (例: `public/locales`) に配置します。

## 今後のステップ

*   各アプリケーションの基本UI/UX設計と実装
*   Stripe Connect 連携による決済機能
*   スマートロック連携
*   データベーススキーマの詳細設計と実装 (Prisma)
*   API エンドポイントの設計と実装 (tRPC)
*   テスト戦略に基づくテストコードの実装
*   CI/CD パイプラインの構築
*   詳細なドキュメント作成

この README はプロジェクトの進捗に合わせて更新されます。 