# プロジェクト設定

## ⚠️ 最重要原則（必読）

### 法令遵守
```yaml
著作権法その他法令違反の禁止:
  - BlueLampなどのアイデアを参考にするのはOK
  - しかし著作権侵害・商標侵害は絶対に行わない
  - コードはオリジナルで実装
  - UIデザインは類似してもOKだが、コピーは不可
  - 商標・ロゴ等の無断使用は禁止
```

### 料金発生時の承認プロセス（絶対厳守）
```yaml
料金が発生する前の必須手順:
  1. ユーザーに料金発生を通知
  2. ユーザーの了承を得る
  3. さらにダブルチェック: 「本当に宜しいですか？」と念押し
  4. 承認を得てから実行

料金が発生するケース:
  - 外部サービスの有料プラン契約
  - APIキーの取得（有料の場合）
  - クラウドサービスの有料枠利用
  - 課金が発生する操作（デプロイ等）

禁止事項:
  ❌ 承認なしに料金が発生する操作を行う
  ❌ 無料枠を超える操作を自動実行
  ❌ ユーザーに無断でクレジットカード情報を入力
```

---

## 基本設定
```yaml
プロジェクト名: マザーAI
開始日: 2025-11-05
技術スタック:
  frontend:
    - React 18 + TypeScript 5
    - MUI v6
    - Monaco Editor
    - Zustand
    - React Query
    - React Router v6
    - Vite 5
    - NextAuth.js
  backend:
    - Python 3.11+
    - FastAPI
    - SQLAlchemy 2.0
    - JWT
    - CrewAI
  database:
    - Neon PostgreSQL
  infrastructure:
    - Vercel (frontend)
    - Google Cloud Run (backend)
    - GitHub Actions (CI/CD)
```

## 開発環境
```yaml
ポート設定:
  # 複数プロジェクト並行開発のため、一般的でないポートを使用
  frontend: 3347
  backend: 8572
  database: 5434

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - DATABASE_URL
    - CLAUDE_API_KEY
    - JWT_SECRET
    - GOOGLE_CLIENT_ID
    - GOOGLE_CLIENT_SECRET
    - GITHUB_CLIENT_ID
    - GITHUB_CLIENT_SECRET
```

## テスト認証情報
```yaml
管理者アカウント:
  email: admin@motherai.local
  password: AdminTest2025!

開発用アカウント:
  email: test@motherai.local
  password: DevTest2025!

外部サービス:
  Claude API: テスト用（本番は各ユーザーのAPIキー）
  Neon: 無料枠で開発
  Vercel: 無料枠で開発
  Google Cloud Run: 無料枠で開発
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: PhaseCard.tsx)
  - ユーティリティ: camelCase.ts (例: formatDate.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)
  - Hooks: use + PascalCase.ts (例: useAuth.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
  - コンポーネント: PascalCase

ディレクトリ名:
  - kebab-case (例: user-profile)
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止（開発時はOK）
  - エラーハンドリング必須
  - 非同期処理は必ずtry-catch
  - APIキーは環境変数で管理

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
  - Prettier: 自動フォーマット有効
  - ESLint: 警告ゼロを維持

セキュリティ:
  - SQLインジェクション対策（SQLAlchemy ORM使用）
  - XSS対策（React自動エスケープ + DOMPurify）
  - APIキー暗号化保存（Fernet）
  - パスワードハッシュ化（bcrypt）
  - JWT有効期限設定（24時間）
```

### コミットメッセージ
```yaml
形式: [type]: [description]

type:
  - feat: 新機能
  - fix: バグ修正
  - docs: ドキュメント
  - style: フォーマット
  - refactor: リファクタリング
  - test: テスト
  - chore: その他

例:
  - "feat: Phase 1エージェント実装"
  - "fix: ログイン時のJWT検証エラー修正"
  - "docs: API仕様書更新"
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/users, /projects)
  - ケバブケース使用 (/api-monitor)
  - バージョニング: /api/v1/...

認証:
  - JWT Bearer Token
  - Header: Authorization: Bearer <token>

エラーレスポンス統一:
  {
    "error": "エラーメッセージ",
    "code": "ERROR_CODE",
    "details": {}
  }

成功レスポンス統一:
  {
    "data": {},
    "message": "成功メッセージ"
  }
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: src/types/index.ts

同期ルール:
  - 共通の型（User、Project等）は両ファイルで同一内容を保つ
  - 片方を更新したら即座にもう片方も更新
  - TypeScriptの型とPythonのPydanticモデルを同期

主要型:
  - User
  - Application
  - Project
  - ChatMessage
  - GeneratedCode
  - PhaseProgress
  - APIUsageLog
```

### Phase管理
```yaml
Phase構造:
  - Phase 1: 要件定義エージェント
  - Phase 2: コード生成エージェント
  - Phase 3: デプロイエージェント
  - Phase 4: 自己改善エージェント（マザーAI専用）

Phase状態:
  - locked: まだアクセスできない
  - available: クリック可能
  - in_progress: 実行中
  - completed: 完了

Phaseの進行:
  - シーケンシャル（Phase 1完了 → Phase 2解放）
  - 各Phaseは独立したエージェントが担当
  - PhaseProgressテーブルで状態管理
```

## 🆕 最新技術情報（知識カットオフ対応）

### Claude API最新情報（2025年）
```yaml
モデル:
  - Haiku 4.5: $1/$5（入力/出力、100万トークン）
  - Sonnet 4.5: $3/$15（推奨、メイン使用）
  - Opus 4.1: $15/$75（高度なタスクのみ）

プロンプトキャッシング:
  - 実装必須（50%コスト削減）
  - キャッシュ書き込み: 1.25x
  - キャッシュヒット: 0.1x
  - TTL: 5分

ストリーミング:
  - Server-Sent Events (SSE)使用
  - トークン単位で逐次表示
  - エラーハンドリング必須

Function Calling:
  - 利用可能
  - Thinking Tokensに注意（課金対象）
```

### React 18 + Vite 5
```yaml
注意点:
  - Vite 5はESM優先（CommonJS非推奨）
  - React 18はConcurrent Mode対応
  - Suspense for Data Fetching使用可能

推奨構成:
  - React Router v6（最新安定版）
  - React Query v5（データフェッチ）
  - Zustand（状態管理）
```

### MUI v6
```yaml
重要な変更:
  - CSS-in-JS からEmotion採用
  - sx prop推奨
  - テーマカスタマイズ強化

使用ガイドライン:
  - コンポーネントはMUIを優先使用
  - カスタムスタイルはsx prop
  - レスポンシブ対応必須
```

### VSCode Webview Toolkit廃止対応
```yaml
注意:
  - 2025年1月非推奨
  - 代替: カスタムUIコンポーネント実装
  - Web版優先のため影響は最小限
```

## ⚠️ プロジェクト固有の注意事項

### API料金管理
```yaml
重要:
  - Claude API料金の爆発的増加に注意
  - A-003（API監視ダッシュボード）で常時監視
  - プロンプトキャッシング必須実装
  - 異常な使用量は即座にユーザー停止

対策:
  - ユーザーごとのAPI使用量制限
  - 日次/月次上限設定
  - アラートメール自動送信
  - 実質コスト: 5-6万円/案件を維持
```

### 承認制運用
```yaml
初期段階:
  - 全ユーザー申請を手動審査
  - 真剣なユーザーのみ承認
  - 不正利用・スパムは即座に却下

審査基準:
  - 利用目的が明確
  - 実現可能な案件を想定
  - 使い捨てメールアドレスは却下
```

### 自己改善機能の制約
```yaml
重要:
  - マザーAI自身のコード変更は慎重に
  - 重要な変更は人間の承認必須
  - ロールバック機能必須
  - サンドボックス環境でテスト後に本番反映
```

### セキュリティ
```yaml
機密情報:
  - APIキーは暗号化保存（Fernet）
  - 環境変数は.envファイル（.gitignore必須）
  - JWT秘密鍵は絶対に公開しない
  - ユーザーのコードも機密扱い

データ保護:
  - プロジェクトデータは作成者のみアクセス
  - 管理者も必要最小限の閲覧
  - 削除されたデータは完全削除（論理削除不可）
```

## 📝 作業ログ（最新5件）

```yaml
- 2025-11-05: 要件定義書作成完了
- 2025-11-05: 技術スタック決定（React + FastAPI + Claude API）
- 2025-11-05: ページ構成確定（MVP: 10ページ）
- 2025-11-05: SCOPE_PROGRESS作成完了
- 2025-11-05: CLAUDE.md作成完了
```

## 🎯 MVP開発スコープ（10-14日）

### 含める機能
```yaml
必須:
  ✅ プロジェクト管理UI
  ✅ 4つのPhaseエージェント
  ✅ PhaseカードUI（BlueLamp風）
  ✅ リアルタイムAI対話（SSE）
  ✅ Monaco Editor統合
  ✅ 自動デプロイ（Vercel + GCR）
  ✅ 承認制ユーザー管理
  ✅ API監視ダッシュボード
  ✅ プロンプトキャッシング
  ✅ 自己改善機能（Phase 4）
```

### 削除する機能（後期追加）
```yaml
後期:
  ❌ Phase 5-14（マザーAI自身が追加）
  ❌ モバイルアプリ対応
  ❌ VSCode拡張
  ❌ OpenAI API統合
  ❌ Redis統合
  ❌ Stripe決済
  ❌ 高度な分析機能
  ❌ チーム協業機能
```

## 🚀 次のステップ

要件定義（Phase 1）が完了しました。次は**実装フェーズ**です。

### 推奨作業順序
```
1. GitHubリポジトリ作成
2. 開発環境セットアップ
   - フロントエンド（React + Vite）
   - バックエンド（FastAPI）
   - Neon PostgreSQL接続
3. 基本認証実装
4. P-002, P-003実装（申請・ログイン）
5. P-005実装（AI対話・Phaseカード）
6. Phase 1-3エージェント実装
7. 管理画面実装
8. Phase 4（自己改善）実装
9. テスト・デプロイ
```

---

## 本番環境デプロイ情報

```yaml
デプロイ日: 2025-11-08（最新）
環境構成: シンプル構成（開発DB + 本番環境）

本番URL:
  Frontend: https://frontend-7b8pescz6-wlicenses-projects.vercel.app
  Backend: https://mother-ai-backend-735112328456.asia-northeast1.run.app

インフラ:
  Frontend: Vercel（無料枠）
  Backend: Google Cloud Run（無料枠、asia-northeast1）
  Database: Supabase PostgreSQL（開発環境を共有）

重要な注記:
  - API URLパスの二重化問題を修正（/api/v1 が二重になっていた）
  - CORS設定を最新のフロントエンドURLに更新
  - VITE_API_BASE_URLからパスを削除（axios.tsで自動追加するため）
  - CrewAIは一旦コメントアウト（ビルド時間短縮のため）
  - エージェント機能は後で追加予定
```

---

**作成日**: 2025年11月5日
**最終更新**: 2025年11月08日
**バージョン**: 1.2
**プロジェクトステータス**: 本番環境デプロイ完了・動作検証中
