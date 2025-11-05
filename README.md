# マザーAI - AI駆動開発プラットフォーム

非エンジニアでも大規模案件を完遂できる、AI駆動開発プラットフォームです。

## プロジェクト概要

マザーAIは、完全な初心者（開発経験ゼロ）でも、AIとの対話だけで大規模なWebアプリケーションを開発・デプロイできるプラットフォームです。

### 主な機能

- **Phase 1: 要件定義** - AIとの対話でプロジェクト要件を明確化
- **Phase 2: コード生成** - React + FastAPIのフルスタックコードを自動生成
- **Phase 3: デプロイ** - Vercel + Google Cloud Runへ自動デプロイ
- **Phase 4: 自己改善** - マザーAI自身が自己改善・拡張

### 技術スタック

#### フロントエンド
- React 18 + TypeScript 5
- Material-UI (MUI) v6
- Zustand (状態管理)
- Monaco Editor (コードエディタ)
- Vite 5 (ビルドツール)

#### バックエンド
- Python 3.11+
- FastAPI (Webフレームワーク)
- SQLAlchemy 2.0 (ORM)
- Neon PostgreSQL (データベース)
- CrewAI (マルチエージェント)
- Claude API (AI)

#### インフラ
- Frontend: Vercel
- Backend: Google Cloud Run
- Database: Neon PostgreSQL (serverless)
- CI/CD: GitHub Actions

## プロジェクト構造

```
.
├── frontend/                 # フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   │   └── layouts/     # レイアウトコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   │   ├── guest/       # ゲスト向けページ
│   │   │   ├── user/        # ユーザー向けページ
│   │   │   └── admin/       # 管理者向けページ
│   │   ├── stores/          # Zustand状態管理
│   │   ├── config/          # 設定ファイル
│   │   └── types/           # TypeScript型定義
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # バックエンド (Python + FastAPI)
│   ├── app/
│   │   ├── api/             # APIルート
│   │   │   ├── auth.py      # 認証API
│   │   │   ├── projects.py  # プロジェクトAPI
│   │   │   ├── admin.py     # 管理API
│   │   │   └── agents.py    # エージェントAPI
│   │   ├── agents/          # AIエージェント
│   │   │   ├── base.py      # 基底クラス
│   │   │   └── phase_agents.py  # Phase 1-4エージェント
│   │   ├── core/            # コア機能
│   │   │   ├── config.py    # 設定
│   │   │   ├── database.py  # DB接続
│   │   │   ├── security.py  # 認証・セキュリティ
│   │   │   └── deps.py      # 依存関係
│   │   ├── models/          # データモデル
│   │   │   └── models.py    # SQLAlchemyモデル
│   │   └── main.py          # アプリケーションエントリポイント
│   └── requirements.txt
│
└── docs/                     # ドキュメント
    ├── requirements.md       # 要件定義書
    └── SCOPE_PROGRESS.md    # 進捗管理

```

## セットアップ

### 必要要件

- Node.js 18+
- Python 3.11+
- PostgreSQL (またはNeon PostgreSQLアカウント)

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd 25年11月5日
```

### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install
cp .env.example .env
# .envファイルを編集して設定を行う
npm run dev
```

フロントエンドは http://localhost:3347 で起動します。

### 3. バックエンドのセットアップ

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .envファイルを編集して設定を行う
python -m app.main
```

バックエンドは http://localhost:8572 で起動します。

### 4. データベースのセットアップ

```bash
# Neon PostgreSQLの接続文字列を.envに設定
# DATABASE_URL=postgresql://user:password@host/database

# データベースを初期化
python -c "from app.core.database import init_db; init_db()"
```

## 環境変数

### フロントエンド (.env)

```env
VITE_API_URL=http://localhost:8572
VITE_APP_NAME=マザーAI
```

### バックエンド (.env)

```env
# App
DEBUG=true
PORT=8572

# Database
DATABASE_URL=postgresql://user:password@localhost:5434/mother_ai

# JWT
SECRET_KEY=your-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Claude API
CLAUDE_API_KEY=sk-ant-xxxxx
CLAUDE_MODEL=claude-3-5-sonnet-20250929

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

詳細は `backend/.env.example` を参照してください。

## 開発ガイド

### ページ構成

#### ゲスト向けページ
- `/` - ランディングページ
- `/login` - ログインページ
- `/apply` - 利用申請ページ

#### ユーザー向けページ
- `/pending` - 審査待ちページ
- `/projects` - プロジェクト一覧
- `/projects/:id` - プロジェクト詳細 (Phase cards UI)
- `/profile` - プロフィール・設定

#### 管理者向けページ
- `/admin/applications` - 申請審査
- `/admin/users` - ユーザー管理
- `/admin/api-monitor` - API監視ダッシュボード

### エージェント構造

マザーAIは5つのエージェントで構成されています：

1. **OrchestratorAgent** - プロジェクト統括
2. **Phase1RequirementsAgent** - 要件定義
3. **Phase2CodeGenerationAgent** - コード生成
4. **Phase3DeploymentAgent** - デプロイ
5. **Phase4SelfImprovementAgent** - 自己改善

### 将来の拡張

#### 階層型マルチエージェント (Phase 2: 30-60日)
```
CEO AI (オーケストレーター)
 ├─ 要件定義部長
 │   ├─ 要件分析課長
 │   └─ ユーザーインタビュー課長
 ├─ 実装部長
 │   ├─ フロントエンド課長
 │   └─ バックエンド課長
 └─ 品質管理部長
     ├─ テスト課長
     └─ セキュリティ課長
```

## API ドキュメント

バックエンドを起動後、以下のURLでSwagger UIにアクセスできます：

- http://localhost:8572/docs

## セキュリティ

### 法令遵守

- 著作権法その他法令違反は行わない
- BlueLampなどのアイデアを参考にするのはOKだが、コードはオリジナル
- 商標・ロゴ等の無断使用は禁止

### 料金発生時の承認プロセス

料金が発生するサービス利用・契約の前に、必ずユーザーの了承を得ます：

1. 料金発生を通知
2. ユーザーの了承を得る
3. ダブルチェック: 「本当に宜しいですか？」と念押し
4. 承認を得てから実行

### 自己拡張の安全対策

Phase 4の自己改善機能には以下の安全対策を実装：

1. Sandboxテスト環境（必須）
2. 人間の承認ワークフロー（必須）
3. 自動セキュリティスキャン
4. バージョン管理とロールバック
5. 詳細な監査ログ
6. 外部依存関係のホワイトリスト
7. レート制限（暴走防止）
8. 緊急停止スイッチ

## ライセンス

[ライセンス情報をここに記載]

## 貢献

[貢献ガイドラインをここに記載]

## サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。

---

**開始日**: 2025年11月5日
**バージョン**: 0.1.0 (MVP)
