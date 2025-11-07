# デプロイメントガイド

## 目次
1. [前提条件](#前提条件)
2. [環境変数設定](#環境変数設定)
3. [フロントエンドデプロイ（Vercel）](#フロントエンドデプロイvercel)
4. [バックエンドデプロイ（Google Cloud Run）](#バックエンドデプロイgoogle-cloud-run)
5. [GitHub Actions設定](#github-actions設定)
6. [デプロイ後の確認](#デプロイ後の確認)

---

## 前提条件

### 必要なアカウント
- ✅ GitHub アカウント
- ✅ Vercel アカウント（無料枠利用）
- ✅ Google Cloud Platform アカウント（無料枠利用）
- ✅ Neon PostgreSQL アカウント（無料枠利用）

### ローカル環境
- Node.js 20.x
- Python 3.11+
- Docker（バックエンドのローカルビルドテスト用）

---

## 環境変数設定

### フロントエンド環境変数（Vercel）

**ファイル**: `frontend/.env.local`（ローカル開発用）

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8572/api/v1  # 開発環境
# VITE_API_BASE_URL=https://your-backend.run.app/api/v1  # 本番環境
```

**Vercel設定**:
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 以下の変数を追加:

```
VITE_API_BASE_URL: https://your-backend.run.app/api/v1
```

---

### バックエンド環境変数（Google Cloud Run）

**ファイル**: `backend/.env`（ローカル開発用、Gitにコミットしない）

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Claude API
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OAuth（オプション、後で追加可能）
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Application
APP_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app,https://another-domain.com
```

**Google Cloud Run設定**:

コマンドラインで設定:
```bash
gcloud run services update mother-ai-backend \
  --set-env-vars "DATABASE_URL=postgresql://...,JWT_SECRET=...,CLAUDE_API_KEY=..."
```

または、Google Cloud Console → Cloud Run → サービス詳細 → 環境変数タブから設定

---

## フロントエンドデプロイ（Vercel）

### 手動デプロイ（初回）

#### 1. Vercel CLIインストール
```bash
npm install -g vercel
```

#### 2. Vercel CLIでログイン
```bash
vercel login
```

#### 3. プロジェクトをVercelにリンク
```bash
cd frontend
vercel link
```

質問に答える:
- Set up and deploy: `yes`
- Which scope: 自分のアカウントを選択
- Link to existing project: `no`
- Project name: `mother-ai-frontend`（任意）
- Directory: `./`

#### 4. 環境変数設定
```bash
vercel env add VITE_API_BASE_URL production
# 値を入力: https://your-backend.run.app/api/v1
```

#### 5. デプロイ
```bash
vercel --prod
```

### GitHub連携による自動デプロイ

1. Vercelダッシュボード → プロジェクト選択 → Settings → Git
2. GitHubリポジトリを接続
3. Production Branch: `main`
4. 以降、`main`ブランチへのpushで自動デプロイ

**重要**: デプロイ前にユーザー承認が必要です！
```
⚠️ Vercelへの接続は無料枠で利用可能ですが、
   初回デプロイ前に必ず以下を確認してください：

   1. 無料枠の制限（月間100GB帯域幅、1000回ビルド）
   2. デプロイ料金が発生しないことを確認
   3. 課金設定がないことを確認

   料金が発生する可能性がある場合は、ユーザーに承認を得てください。
```

---

## バックエンドデプロイ（Google Cloud Run）

### 事前準備

#### 1. GCPプロジェクト作成
```bash
# GCP Console: https://console.cloud.google.com/
# 新しいプロジェクトを作成: "mother-ai-backend"
```

#### 2. 必要なAPIを有効化
```bash
gcloud config set project PROJECT_ID

# Cloud Run API
gcloud services enable run.googleapis.com

# Container Registry API
gcloud services enable containerregistry.googleapis.com

# Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

#### 3. サービスアカウント作成
```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

#### 4. サービスアカウントキーをダウンロード
```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

### 手動デプロイ（初回）

#### 1. Dockerイメージをビルド
```bash
cd backend
docker build -t gcr.io/PROJECT_ID/mother-ai-backend:latest .
```

#### 2. GCRにプッシュ
```bash
docker push gcr.io/PROJECT_ID/mother-ai-backend:latest
```

#### 3. Cloud Runにデプロイ
```bash
gcloud run deploy mother-ai-backend \
  --image gcr.io/PROJECT_ID/mother-ai-backend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your-database-url",JWT_SECRET="your-jwt-secret",CLAUDE_API_KEY="your-claude-api-key"
```

**重要**: デプロイ前にユーザー承認が必要です！
```
⚠️ Google Cloud Runへのデプロイは無料枠で利用可能ですが、
   初回デプロイ前に必ず以下を確認してください：

   1. 無料枠の制限（月間200万リクエスト、360,000 vCPU秒、180,000 GiB秒）
   2. デプロイ料金が発生しないことを確認
   3. 課金設定を確認

   料金が発生する可能性がある場合は、ユーザーに承認を得てください。
```

---

## GitHub Actions設定

### GitHub Secrets設定

GitHubリポジトリ → Settings → Secrets and variables → Actions → New repository secret

以下のsecretsを追加:

#### Vercel関連
```
VERCEL_TOKEN: Vercelのアクセストークン
VERCEL_ORG_ID: VercelのOrganization ID
VERCEL_PROJECT_ID: VercelのProject ID
```

取得方法:
- `VERCEL_TOKEN`: Vercel Dashboard → Settings → Tokens → Create Token
- `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`: `vercel link`実行後の`.vercel/project.json`に記載

#### Google Cloud関連
```
GCP_CREDENTIALS: サービスアカウントキー（key.jsonの内容）
GCP_PROJECT_ID: GCPプロジェクトID
```

#### アプリケーション環境変数
```
DATABASE_URL: Neon PostgreSQL接続文字列
JWT_SECRET: JWT秘密鍵
CLAUDE_API_KEY: Claude APIキー
```

---

## デプロイ後の確認

### フロントエンド確認

1. Vercelのデプロイログを確認
```bash
vercel logs
```

2. ブラウザでアクセス
```
https://your-app.vercel.app
```

3. 動作確認項目:
- [ ] ログインページが表示される
- [ ] バックエンドAPIに接続できる
- [ ] プロジェクト一覧が表示される
- [ ] 新規プロジェクト作成ができる
- [ ] AI対話ができる

### バックエンド確認

1. Cloud Runのログを確認
```bash
gcloud run services logs read mother-ai-backend --limit=50
```

2. ヘルスチェック
```bash
curl https://your-backend.run.app/health
```

3. API動作確認:
```bash
# ユーザー登録
curl -X POST https://your-backend.run.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test2025!","name":"Test User"}'

# ログイン
curl -X POST https://your-backend.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test2025!"}'
```

---

## トラブルシューティング

### Vercel デプロイエラー

#### ビルドエラー
```bash
# ローカルでビルドテスト
cd frontend
npm run build

# エラーログを確認
vercel logs --follow
```

#### 環境変数が読み込まれない
- Vercelダッシュボードで環境変数を確認
- `VITE_`プレフィックスがあることを確認
- 再デプロイ

### Google Cloud Run デプロイエラー

#### Dockerビルドエラー
```bash
# ローカルでビルドテスト
cd backend
docker build -t test-image .
docker run -p 8080:8080 test-image
```

#### 起動エラー
```bash
# Cloud Runログを確認
gcloud run services logs read mother-ai-backend --limit=100

# 環境変数を確認
gcloud run services describe mother-ai-backend
```

#### データベース接続エラー
- DATABASE_URLが正しいことを確認
- Neon PostgreSQLの接続制限を確認
- Cloud RunからNeonへのネットワーク接続を確認

---

## コスト管理

### 無料枠の制限

#### Vercel（無料プラン）
- 月間100GB帯域幅
- 月間1000回ビルド
- プレビューデプロイ無制限

#### Google Cloud Run（無料枠）
- 月間200万リクエスト
- 月間360,000 vCPU秒
- 月間180,000 GiB秒

#### Neon PostgreSQL（無料プラン）
- 0.5 GBストレージ
- 1つのプロジェクト
- 10 GBデータ転送/月

### コスト監視

#### GCP予算アラート設定
```bash
# GCP Console → Billing → Budgets & alerts
# 予算: $10/月
# アラート: 50%, 90%, 100%
```

#### Vercel使用状況確認
```
Vercel Dashboard → Settings → Usage
```

---

**作成日**: 2025-11-07
**最終更新**: 2025-11-07
