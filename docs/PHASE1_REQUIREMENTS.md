# Phase 1: 要件定義書（完了版）

**プロジェクト名**: マザーAI
**Phase**: Phase 1 - 要件定義
**ステータス**: ✅ 完了
**作成日**: 2025年11月5日
**最終更新**: 2025年11月5日

---

## 📋 エグゼクティブサマリー

マザーAIは、**AI自身がAIアプリケーションを開発するプラットフォーム**です。ユーザーは要件を伝えるだけで、マザーAIが要件定義から設計、実装、デプロイ、さらには自己改善まで全自動で行います。

### コアコンセプト

```yaml
ビジョン:
  - AI開発者が、人間の代わりにアプリケーション開発を完遂
  - 要件定義から本番デプロイまで完全自動化
  - AI自身が自己改善し、無限に進化する

ターゲットユーザー:
  - 非エンジニア: アイデアを持つビジネスパーソン
  - エンジニア: 高速プロトタイピングを求める開発者
  - 企業: AI活用で開発コストを削減したい組織

差別化ポイント:
  - 単なるコード生成ではなく、「完成したアプリ」を提供
  - Phase 4（自己改善）でマザーAI自身が進化
  - 承認制で質の高いユーザーのみ受け入れ
```

---

## 🎯 プロジェクト目標

### ビジネス目標

1. **MVP完成**: 10-14日で実用可能なプラットフォームを構築
2. **早期ユーザー獲得**: 承認制で真剣なユーザーを10-50名獲得
3. **実績構築**: 実際のアプリケーション開発成功事例を5-10件作成
4. **自己改善の実証**: Phase 4でマザーAI自身が機能追加する実績

### 技術目標

1. **Claude API統合**: プロンプトキャッシングで50%コスト削減
2. **SSEストリーミング**: リアルタイムAI対話の実装
3. **自動デプロイ**: Vercel + Google Cloud Runへのワンクリックデプロイ
4. **API監視**: コスト爆発防止のための監視ダッシュボード

---

## 🏗️ システム設計

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    ユーザー                              │
│                  （ブラウザ）                            │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              フロントエンド（Vercel）                     │
│  React 18 + TypeScript + MUI v6 + Monaco Editor         │
│  ・PhaseカードUI ・チャットUI ・コードエディタ            │
└────────────┬────────────────────────────────────────────┘
             │ REST API / SSE
             ▼
┌─────────────────────────────────────────────────────────┐
│          バックエンド（Google Cloud Run）                 │
│        FastAPI + SQLAlchemy + CrewAI                     │
│  ・4つのPhaseエージェント ・認証 ・プロジェクト管理        │
└────────────┬──────────────┬─────────────────────────────┘
             │              │
             ▼              ▼
    ┌────────────────┐  ┌────────────────────────┐
    │ Neon PostgreSQL│  │   Claude API (Sonnet)   │
    │  ユーザー/      │  │  要件定義/コード生成/   │
    │  プロジェクト   │  │  自己改善              │
    └────────────────┘  └────────────────────────┘
```

### 技術スタック

```yaml
フロントエンド:
  言語: TypeScript 5
  フレームワーク: React 18
  ビルドツール: Vite 5
  UI: Material-UI (MUI) v6
  ルーティング: React Router v6
  状態管理: Zustand
  データフェッチ: React Query v5
  コードエディタ: Monaco Editor
  認証: NextAuth.js
  デプロイ: Vercel

バックエンド:
  言語: Python 3.11+
  フレームワーク: FastAPI
  ORM: SQLAlchemy 2.0
  認証: JWT (python-jose)
  エージェント: CrewAI
  AI API: Claude API (Anthropic)
  デプロイ: Google Cloud Run

データベース:
  メインDB: Neon PostgreSQL（無料枠）
  キャッシュ: 未実装（後期: Redis）

インフラ:
  CI/CD: GitHub Actions
  ホスティング: Vercel (FE) + Google Cloud Run (BE)
  モニタリング: カスタムAPI監視ダッシュボード
```

---

## 📱 機能要件

### MVP機能（10-14日で実装）

#### 1. ユーザー管理機能

```yaml
申請フォーム (P-002):
  - 基本情報入力（名前、メール、利用目的）
  - OAuth認証（Google/GitHub）
  - 利用規約同意
  - 申請理由（自由記述）

承認制ユーザー管理:
  - 管理者による申請審査（A-001）
  - 承認/却下の判断
  - メール通知（承認・却下通知）
  - スパム検出・防止

ログイン (P-003):
  - メール/パスワード認証
  - OAuth認証（Google/GitHub）
  - JWT発行（有効期限24時間）
  - リフレッシュトークン

マイプロフィール (P-006):
  - プロフィール編集
  - Claude APIキー設定
  - API使用量確認
  - パスワード変更
```

#### 2. プロジェクト管理機能

```yaml
プロジェクト一覧 (P-004):
  - 作成済みプロジェクト表示
  - 新規プロジェクト作成
  - プロジェクト削除
  - 進捗可視化（Phase進行状況）
  - 最終更新日時表示

プロジェクト詳細 (P-005):
  - PhaseカードUI（BlueLamp風デザイン）
  - Phase 1-4のカード表示
  - 各Phaseの状態管理:
    - locked: まだアクセスできない
    - available: クリック可能
    - in_progress: 実行中
    - completed: 完了
```

#### 3. AI対話・開発機能

```yaml
Phase 1: 要件定義エージェント:
  - ユーザーとリアルタイム対話（SSE）
  - 要件の深掘り質問
  - 要件定義書の自動生成
  - 技術スタック提案

Phase 2: コード生成エージェント:
  - フロントエンド/バックエンドコード自動生成
  - Monaco Editor統合
  - リアルタイムコードストリーミング
  - コード説明の生成

Phase 3: デプロイエージェント:
  - Vercel自動デプロイ
  - Google Cloud Run自動デプロイ
  - 環境変数設定
  - デプロイ状況モニタリング

Phase 4: 自己改善エージェント（マザーAI専用）:
  - マザーAI自身のコード分析
  - 改善提案の生成
  - 新機能の実装
  - サンドボックス環境でのテスト
  - 人間承認後に本番反映

チャット機能:
  - SSEストリーミングによるリアルタイム応答
  - コードブロックのシンタックスハイライト
  - Markdown形式のサポート
  - 会話履歴の保存
```

#### 4. 管理者機能

```yaml
申請審査ダッシュボード (A-001):
  - 申請一覧表示
  - 承認/却下ボタン
  - 申請理由の確認
  - メール通知送信
  - 統計情報（承認率、却下率）

ユーザー管理 (A-002):
  - 全ユーザー一覧
  - ユーザーステータス変更
  - プロジェクト監視
  - 異常ユーザーの検出

API監視ダッシュボード (A-003):
  - リアルタイムAPI使用量
  - ユーザーごとの使用量
  - コスト分析
  - アラート設定
  - 使用量制限
```

---

## 🎨 UI/UX設計

### デザイン原則

```yaml
デザインコンセプト:
  - BlueLampを参考にしたモダンなPhaseカードUI
  - ダークモード優先（ライトモードは後期）
  - レスポンシブ対応（モバイルは後期）
  - アクセシビリティ配慮

カラーパレット:
  primary: "#1976d2" (青)
  secondary: "#dc004e" (赤)
  success: "#4caf50" (緑)
  warning: "#ff9800" (オレンジ)
  background: "#121212" (ダークモード)

タイポグラフィ:
  font-family: Roboto, "Noto Sans JP", sans-serif
  コードフォント: "Fira Code", monospace
```

### ページ一覧（MVP: 10ページ）

#### ゲスト向け（3ページ）

| ID    | ページ名           | ルート    | 主要機能                           |
|-------|-------------------|-----------|------------------------------------|
| P-001 | ランディング       | `/`       | サービス説明、デモ動画、申請CTA     |
| P-002 | 申請フォーム       | `/apply`  | 基本情報入力、OAuth連携            |
| P-003 | ログイン           | `/login`  | 認証（メール/OAuth）               |

#### 一般ユーザー向け（4ページ）

| ID    | ページ名           | ルート           | 主要機能                           |
|-------|-------------------|------------------|------------------------------------|
| P-004 | プロジェクト一覧   | `/projects`      | 一覧、新規作成、削除               |
| P-005 | AI対話・開発       | `/projects/:id`  | PhaseカードUI、AIチャット、コード生成 |
| P-006 | マイプロフィール   | `/profile`       | プロフィール編集、APIキー設定       |
| P-007 | 審査待ち           | `/pending`       | 審査中メッセージ                   |

#### 管理者向け（3ページ）

| ID    | ページ名           | ルート                  | 主要機能                           |
|-------|-------------------|-------------------------|------------------------------------|
| A-001 | 申請審査           | `/admin/applications`   | 申請一覧、承認/却下                |
| A-002 | ユーザー管理       | `/admin/users`          | ユーザー一覧、ステータス変更       |
| A-003 | API監視            | `/admin/api-monitor`    | リアルタイム使用量、アラート       |

---

## 🗄️ データベース設計

### 主要テーブル

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- guest, user, admin
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, suspended
    claude_api_key_encrypted TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 申請テーブル
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- プロジェクトテーブル
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    current_phase INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Phase進捗テーブル
CREATE TABLE phase_progress (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    phase_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'locked', -- locked, available, in_progress, completed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    output_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    phase_number INT NOT NULL,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 生成コードテーブル
CREATE TABLE generated_code (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    phase_number INT NOT NULL,
    file_path VARCHAR(500),
    content TEXT,
    language VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- API使用ログテーブル
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    model VARCHAR(50),
    input_tokens INT,
    output_tokens INT,
    cached_tokens INT,
    cost_usd DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 セキュリティ要件

### 認証・認可

```yaml
認証方式:
  - JWT Bearer Token（24時間有効期限）
  - OAuth 2.0（Google/GitHub）
  - リフレッシュトークン（7日間有効）

パスワード:
  - bcryptでハッシュ化
  - 最低8文字、大小英数記号を含む
  - パスワードリセット機能

APIキー保護:
  - Fernet暗号化で保存
  - 環境変数から暗号化キー取得
  - 復号化はバックエンドのみ
```

### データ保護

```yaml
機密情報:
  - .envファイルは.gitignore必須
  - APIキーは環境変数で管理
  - JWT秘密鍵は絶対に公開しない
  - ユーザーのコードも機密扱い

アクセス制御:
  - プロジェクトデータは作成者のみアクセス
  - 管理者も必要最小限の閲覧
  - 削除されたデータは完全削除（論理削除不可）

CORS:
  - 本番環境のみ許可
  - 開発環境はlocalhostのみ

SQL対策:
  - SQLAlchemy ORMを使用
  - 生SQLは原則禁止
  - パラメータ化クエリ必須
```

---

## 💰 コスト管理

### Claude API料金（2025年最新）

```yaml
モデル:
  Haiku 4.5: $1/$5 (入力/出力、100万トークン)
  Sonnet 4.5: $3/$15 (推奨)
  Opus 4.1: $15/$75 (高度なタスクのみ)

プロンプトキャッシング:
  キャッシュ書き込み: 1.25x
  キャッシュヒット: 0.1x (90%削減)
  TTL: 5分

目標コスト:
  案件あたり: 5-6万円
  プロンプトキャッシング活用で50%削減
```

### コスト削減策

```yaml
実装必須:
  - プロンプトキャッシング
  - ユーザーごとのAPI使用量制限
  - 日次/月次上限設定
  - 異常検知アラート

監視:
  - A-003（API監視ダッシュボード）
  - リアルタイム使用量表示
  - コスト分析
  - アラートメール自動送信
```

---

## 🚀 デプロイ戦略

### インフラ構成

```yaml
フロントエンド:
  サービス: Vercel
  プラン: 無料枠（Pro必要時は承認後）
  機能: 自動デプロイ、Preview環境、HTTPS

バックエンド:
  サービス: Google Cloud Run
  プラン: 無料枠（月100万リクエスト）
  機能: 自動スケーリング、コンテナ化

データベース:
  サービス: Neon PostgreSQL
  プラン: 無料枠（500MB、10GBストレージ）
  機能: 自動バックアップ、SSL接続
```

### CI/CD

```yaml
GitHub Actions:
  トリガー: main/developブランチへのpush

  フロントエンド:
    - npm install
    - npm run build
    - Vercelへデプロイ

  バックエンド:
    - Docker build
    - Google Cloud Runへデプロイ

  テスト:
    - ESLint/Prettier
    - TypeScript型チェック
    - pytest（バックエンド）
```

---

## 📅 開発スケジュール

### MVP（10-14日）

```yaml
Day 1-2: 基盤構築
  - GitHubリポジトリ作成 ✅
  - フロントエンド雛形（React + MUI）
  - バックエンド雛形（FastAPI）
  - Neon PostgreSQL接続
  - 基本認証実装（JWT）

Day 3-4: 認証・ユーザー管理
  - P-002: 申請フォーム実装
  - P-003: ログインページ実装
  - P-007: 審査待ちページ実装
  - A-001: 申請審査ダッシュボード実装
  - メール通知機能実装
  - OAuth連携（Google/GitHub）

Day 5-7: コア機能
  - P-004: プロジェクト一覧実装
  - P-005: PhaseカードUI実装
  - Claude API統合
  - SSEストリーミング実装
  - Phase 1エージェント（要件定義）
  - Phase 2エージェント（コード生成）
  - Phase 3エージェント（デプロイ）
  - プロンプトキャッシング実装
  - Monaco Editor統合

Day 8-9: 管理機能・デプロイ
  - P-006: マイプロフィール実装
  - A-002: ユーザー管理実装
  - A-003: API監視ダッシュボード実装
  - 自動デプロイ機能実装
  - Vercel/GCR連携
  - GitHub Actions設定

Day 10: テスト・調整
  - 統合テスト実施
  - バグ修正
  - パフォーマンス最適化
  - ドキュメント整備

Day 11-14: 自己改善機能・仕上げ
  - Phase 4エージェント（自己改善）実装
  - P-001: ランディングページ実装
  - 最終テスト
  - 本番デプロイ
  - ユーザー受け入れ準備
```

---

## 🔮 後期拡張予定

### Phase 5-14（マザーAI自身が実装）

```yaml
Phase 5: テストエージェント
  - 自動テスト生成
  - ユニットテスト/E2Eテスト
  - テストカバレッジ分析

Phase 6: リファクタリングエージェント
  - コード品質分析
  - パフォーマンス改善
  - セキュリティ監査

Phase 7: ドキュメント生成エージェント
  - API仕様書自動生成
  - README自動生成
  - ユーザーマニュアル作成

Phase 8-14+: ユーザーニーズに応じた無限拡張
```

### 機能拡張

```yaml
技術統合:
  - OpenAI API統合（フォールバック）
  - Redis統合（キャッシュ強化）
  - Stripe統合（決済）

プラットフォーム拡張:
  - モバイルアプリ対応（Flutter）
  - VSCode拡張機能
  - CLI ツール

ページ拡張:
  - A-004: システム設定
  - P-008: プロジェクトテンプレート共有
  - P-009: チーム協業機能
  - P-010: 統計ダッシュボード
```

---

## ⚠️ リスクと対策

### 技術的リスク

```yaml
Claude API料金爆発:
  リスク: 使用量増加でコスト超過
  対策:
    - プロンプトキャッシング必須実装
    - ユーザーごとの使用量制限
    - API監視ダッシュボード（A-003）
    - アラート自動送信

スパムユーザー:
  リスク: 不正利用・APIキー悪用
  対策:
    - 承認制ユーザー管理
    - 申請理由の審査
    - 異常検知アルゴリズム
    - 即座のアカウント停止機能

自己改善の暴走:
  リスク: Phase 4で不適切な変更
  対策:
    - 人間承認必須プロセス
    - サンドボックス環境でのテスト
    - ロールバック機能
    - 重要ファイルの保護
```

### ビジネスリスク

```yaml
競合参入:
  リスク: 類似サービスの登場
  対策:
    - 早期リリース（MVP 10-14日）
    - 自己改善機能で差別化
    - 実績・事例の蓄積

ユーザー獲得失敗:
  リスク: 申請者が少ない
  対策:
    - ランディングページ最適化
    - SNS/コミュニティでの露出
    - デモ動画作成

品質問題:
  リスク: 生成コードの品質が低い
  対策:
    - Phase 5（テスト）の早期実装
    - ユーザーフィードバック収集
    - 継続的な改善
```

---

## ✅ 受入基準

### MVP完成の定義

```yaml
必須機能:
  ✅ ユーザー登録・承認制ログイン
  ✅ プロジェクト作成・管理
  ✅ Phase 1-3のエージェント動作
  ✅ SSEストリーミングでのAI対話
  ✅ コード生成とMonaco Editor表示
  ✅ Vercel/GCRへの自動デプロイ
  ✅ API監視ダッシュボード
  ✅ Phase 4（自己改善）の基本動作

品質基準:
  ✅ TypeScript/ESLint警告ゼロ
  ✅ 主要機能のE2Eテスト成功
  ✅ レスポンス速度: 3秒以内（通常操作）
  ✅ セキュリティ監査クリア

ドキュメント:
  ✅ README整備
  ✅ API仕様書作成
  ✅ 環境構築手順書作成
```

---

## 📚 参考資料

### 外部ドキュメント

```yaml
Claude API:
  - https://docs.anthropic.com/claude/docs
  - プロンプトキャッシング: https://docs.anthropic.com/claude/docs/prompt-caching
  - SSE ストリーミング: https://docs.anthropic.com/claude/reference/streaming

技術スタック:
  - React 18: https://react.dev/
  - FastAPI: https://fastapi.tiangolo.com/
  - MUI v6: https://mui.com/
  - Vite 5: https://vitejs.dev/
  - Neon: https://neon.tech/docs
```

### 内部ドキュメント

```yaml
プロジェクト設定: CLAUDE.md
進捗管理: docs/SCOPE_PROGRESS.md
実装ステータス: docs/IMPLEMENTATION_STATUS.md
```

---

## 📝 変更履歴

```yaml
2025-11-05:
  - Phase 1要件定義完了
  - 技術スタック確定
  - MVP機能スコープ確定
  - データベース設計完了
  - 開発スケジュール確定
  - GitHubリポジトリ作成完了
```

---

**Phase 1ステータス**: ✅ 完了
**次のPhase**: Phase 2（実装フェーズ） - Day 1-2: 基盤構築
**承認者**: -
**承認日**: 2025年11月5日

---

**マザーAI Project**
© 2025 All Rights Reserved
