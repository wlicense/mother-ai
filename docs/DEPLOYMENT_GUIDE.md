# マザーAI デプロイメントガイド

## 📋 目次
1. [デプロイ状況](#デプロイ状況)
2. [フロントエンドデプロイ（完了）](#フロントエンドデプロイ完了)
3. [バックエンドデプロイ（次のステップ）](#バックエンドデプロイ次のステップ)
4. [データベース設定](#データベース設定)
5. [環境変数設定](#環境変数設定)
6. [トラブルシューティング](#トラブルシューティング)

---

## 📊 デプロイ状況

### 完了済み
- ✅ **フロントエンド**: Vercelにデプロイ完了
  - 本番URL: https://frontend-kk9fhxdkz-wlicenses-projects.vercel.app
  - デプロイ日時: 2025-11-07 18:15 JST
  - 状態: 正常稼働中

### 未完了
- ⏳ **バックエンド**: Google Cloud Run（準備中）
- ⏳ **データベース**: Neon PostgreSQL（未設定）
- ⏳ **API統合**: Claude API（未設定）

---

## ✅ フロントエンドデプロイ（完了）

### デプロイ情報
- **プラットフォーム**: Vercel
- **URL**: https://frontend-kk9fhxdkz-wlicenses-projects.vercel.app
- **リポジトリ**: https://github.com/wlicense/mother-ai.git
- **ブランチ**: main
- **フレームワーク**: Vite + React 18
- **ビルド時間**: 7.50秒

### 設定内容
- **セキュリティヘッダー**: XSS, CSRF, Frame保護設定済み
- **SPA対応**: すべてのルートを/index.htmlに転送
- **環境変数**: `VITE_API_BASE_URL` (仮設定: localhost:8572)

### 次回更新時のタスク
バックエンドデプロイ完了後、以下を更新：
```bash
# Vercelダッシュボードで環境変数を更新
VITE_API_BASE_URL=https://your-backend.run.app/api/v1

# 再デプロイ
vercel --prod
```

---

## 🚀 バックエンドデプロイ（次のステップ）

### 準備状況
- ✅ Dockerfileビルド設定完了
- ✅ CI/CD設定完了（GitHub Actions）
- ✅ GCP CLI認証完了
- ⏳ GCPプロジェクト作成（未実施）
- ⏳ Neon PostgreSQL設定（未実施）
- ⏳ 環境変数設定（未実施）

### デプロイ手順

#### Step 1: Neon PostgreSQL設定

1. **アカウント作成**
   ```
   https://neon.tech にアクセス
   無料アカウント登録（GitHubアカウントで可能）
   ```

2. **データベース作成**
   ```
   Dashboard > Create Project
   Project Name: mother-ai-production
   Region: US East (最も近い）
   ```

3. **接続文字列取得**
   ```
   Dashboard > Connection Details
   Copy: postgresql://...
   ```

4. **マイグレーション実行**
   ```bash
   cd backend
   # 接続文字列を環境変数に設定
   export DATABASE_URL="postgresql://..."

   # マイグレーション実行
   alembic upgrade head
   ```

#### Step 2: Google Cloud Platformセットアップ

1. **GCPプロジェクト作成**
   ```bash
   # プロジェクト作成
   gcloud projects create mother-ai-backend --name="Mother AI Backend"

   # プロジェクトを選択
   gcloud config set project mother-ai-backend
   ```

2. **必要なAPI有効化**
   ```bash
   # Cloud Run API
   gcloud services enable run.googleapis.com

   # Container Registry API
   gcloud services enable containerregistry.googleapis.com

   # Cloud Build API
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **サービスアカウント作成**
   ```bash
   # サービスアカウント作成
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Service Account"

   # 権限付与（Cloud Run管理者）
   gcloud projects add-iam-policy-binding mother-ai-backend \
     --member="serviceAccount:github-actions@mother-ai-backend.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   # 権限付与（ストレージ管理者）
   gcloud projects add-iam-policy-binding mother-ai-backend \
     --member="serviceAccount:github-actions@mother-ai-backend.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   # 権限付与（サービスアカウントユーザー）
   gcloud projects add-iam-policy-binding mother-ai-backend \
     --member="serviceAccount:github-actions@mother-ai-backend.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

4. **サービスアカウントキー作成**
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@mother-ai-backend.iam.gserviceaccount.com

   # key.jsonの内容をGitHub Secretsに設定（後述）
   ```

#### Step 3: JWT秘密鍵生成

```bash
# ランダムな秘密鍵を生成（64文字）
openssl rand -hex 32

# 出力例: a1b2c3d4e5f6...
# この値をGitHub Secretsに設定
```

#### Step 4: GitHub Secrets設定

GitHubリポジトリ > Settings > Secrets and variables > Actions

以下のSecretsを追加：

| Secret Name | 値の取得方法 | 必須 |
|-------------|-------------|------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | ✅ |
| `VERCEL_ORG_ID` | frontend/.vercel/project.json | ✅ |
| `VERCEL_PROJECT_ID` | frontend/.vercel/project.json | ✅ |
| `GCP_CREDENTIALS` | key.jsonの内容（JSON全体） | ✅ |
| `GCP_PROJECT_ID` | mother-ai-backend | ✅ |
| `DATABASE_URL` | Neon PostgreSQL接続文字列 | ✅ |
| `JWT_SECRET` | openssl rand -hex 32の出力 | ✅ |
| `CLAUDE_API_KEY` | Anthropic Console | ⏳ |

#### Step 5: mainブランチへプッシュ

```bash
# GitHub Actionsが自動で実行される
git push origin main

# デプロイ状況確認
# GitHub > Actions タブで確認
```

#### Step 6: デプロイ後確認

```bash
# Cloud Runサービス確認
gcloud run services list

# バックエンドURLを取得
gcloud run services describe mother-ai-backend \
  --region=asia-northeast1 \
  --format="value(status.url)"

# ヘルスチェック
curl https://your-backend.run.app/health
```

---

## 💾 データベース設定

### Neon PostgreSQL（無料枠）

#### 制限
- ストレージ: 0.5 GB
- データ転送: 10 GB/月
- プロジェクト数: 1個

#### 接続文字列形式
```
postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require
```

#### マイグレーション
```bash
cd backend

# Alembicでマイグレーション実行
alembic upgrade head

# テーブル確認
psql $DATABASE_URL -c "\dt"
```

---

## 🔐 環境変数設定

### 必須環境変数一覧

#### フロントエンド（Vercel）
```bash
VITE_API_BASE_URL=https://your-backend.run.app/api/v1
```

#### バックエンド（Google Cloud Run）
```bash
# データベース
DATABASE_URL=postgresql://...

# JWT認証
JWT_SECRET=your-super-secret-jwt-key-64chars-minimum
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Claude API
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# アプリケーション
APP_ENV=production
CORS_ORIGINS=https://frontend-kk9fhxdkz-wlicenses-projects.vercel.app
```

### 環境変数設定方法

#### Vercel
```bash
cd frontend

# 環境変数追加
vercel env add VITE_API_BASE_URL production

# 確認
vercel env ls
```

#### Google Cloud Run
```bash
gcloud run services update mother-ai-backend \
  --region=asia-northeast1 \
  --set-env-vars "\
DATABASE_URL=postgresql://...,\
JWT_SECRET=...,\
CLAUDE_API_KEY=...,\
APP_ENV=production,\
CORS_ORIGINS=https://..."
```

---

## 🐛 トラブルシューティング

### フロントエンドエラー

#### ビルドエラー
```bash
# ローカルでビルドテスト
cd frontend
npm run build

# エラーログ確認
vercel logs --follow
```

#### 環境変数が反映されない
1. Vercelダッシュボードで環境変数を確認
2. `VITE_`プレフィックスがあることを確認
3. 再デプロイ: `vercel --prod`

### バックエンドエラー

#### Cloud Runデプロイ失敗
```bash
# ログ確認
gcloud run services logs read mother-ai-backend --limit=100

# サービス状態確認
gcloud run services describe mother-ai-backend --region=asia-northeast1
```

#### データベース接続エラー
1. DATABASE_URLが正しいか確認
2. Neon PostgreSQLの接続制限を確認
3. Cloud RunからNeonへのネットワーク接続を確認

#### GitHub Actionsエラー
1. GitHub > Actions タブでログ確認
2. Secretsが正しく設定されているか確認
3. GCPサービスアカウントの権限を確認

---

## 📝 コスト管理

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
- 10 GBデータ転送/月

#### Claude API（従量課金）
- Sonnet 4.5: $3/$15（入力/出力、100万トークン）
- **プロンプトキャッシング必須実装済み**（50%コスト削減）

### モニタリング

#### GCP予算アラート
```bash
# GCP Console > Billing > Budgets & alerts
# 予算: $10/月
# アラート: 50%, 90%, 100%
```

#### Vercel使用状況
```
Vercel Dashboard > Settings > Usage
```

---

**作成日**: 2025-11-07
**最終更新**: 2025-11-07
**ステータス**: フロントエンドデプロイ完了、バックエンド準備中
