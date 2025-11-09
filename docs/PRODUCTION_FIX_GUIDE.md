# 本番環境修正ガイド

## 🔴 現在の問題

**確認日**: 2025-11-09

### 症状
- **フロントエンド**: ✅ 正常動作
- **バックエンド（ルート）**: ✅ 正常動作
- **バックエンド（認証エンドポイント）**: ❌ 500 Internal Server Error
- **データベース接続**: ❓ 未確認（認証エラーのためテスト不可）

### 推定原因
1. Google Cloud Run環境変数が未設定または不正
2. データベース接続文字列（DATABASE_URL）が未設定
3. JWT秘密鍵（SECRET_KEY）が未設定
4. CORS設定が本番URLに対応していない

---

## 🛠️ 修正手順

### Step 1: Google Cloud Run環境変数の設定

#### 1.1 Google Cloud Consoleにアクセス
```
https://console.cloud.google.com/run
```

#### 1.2 対象サービスを選択
- **サービス名**: `mother-ai-backend`
- **リージョン**: `asia-northeast1`

#### 1.3 環境変数を追加・更新

以下の環境変数を設定してください：

```bash
# 必須（高優先度）
DATABASE_URL=postgresql://[YOUR_NEON_OR_SUPABASE_URL]
SECRET_KEY=[32文字以上のランダム文字列]
ALLOWED_ORIGINS=["https://frontend-7b8pescz6-wlicenses-projects.vercel.app"]

# 推奨（通知機能用）
MAIL_USERNAME=[your-email@gmail.com]
MAIL_PASSWORD=[your-app-password]
MAIL_FROM=noreply@mother-ai.local
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# オプション（OAuth機能用）
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GITHUB_CLIENT_ID=[your-github-client-id]
GITHUB_CLIENT_SECRET=[your-github-client-secret]

# オプション（Claude API - モックモード中は不要）
CLAUDE_API_KEY=[sk-ant-xxxxx]
USE_REAL_AI=false

# アプリ設定
DEBUG=false
PORT=8080
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

#### 1.4 SECRET_KEYの生成方法

ターミナルで以下を実行：
```bash
openssl rand -hex 32
```

出力された文字列を `SECRET_KEY` に設定してください。

---

### Step 2: データベース設定の確認

#### 2.1 Neon/Supabase PostgreSQL接続文字列の取得

**Neon PostgreSQLの場合**:
1. https://console.neon.tech にアクセス
2. プロジェクトを選択
3. "Connection Details" から接続文字列をコピー
4. 形式: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

**Supabaseの場合**:
1. https://app.supabase.com にアクセス
2. プロジェクト → Settings → Database
3. "Connection string" → "URI" をコピー

#### 2.2 DATABASE_URLの設定

上記で取得した接続文字列を Google Cloud Run の `DATABASE_URL` に設定します。

---

### Step 3: Vercel環境変数の更新

#### 3.1 Vercelダッシュボードにアクセス
```
https://vercel.com/wlicenses-projects/frontend/settings/environment-variables
```

#### 3.2 環境変数を更新

```bash
VITE_API_URL=https://mother-ai-backend-735112328456.asia-northeast1.run.app
```

**注意**: `/api/v1` は含めない（axios.tsで自動追加されるため）

---

### Step 4: デプロイの再実行

#### 4.1 Google Cloud Runの再デプロイ

環境変数を設定後、自動的に再デプロイされます。
または、手動で再デプロイ：

```bash
# ローカルから再デプロイ（必要に応じて）
cd backend
gcloud run deploy mother-ai-backend \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

#### 4.2 Vercelの再デプロイ

```bash
# Vercel CLIを使用
cd frontend
vercel --prod
```

または、GitHubにプッシュして自動デプロイ：
```bash
git add .
git commit -m "fix: 本番環境設定を更新"
git push origin main
```

---

### Step 5: 動作確認

#### 5.1 バックエンドAPIの確認

```bash
# ルートエンドポイント
curl https://mother-ai-backend-735112328456.asia-northeast1.run.app/

# ヘルスチェック
curl https://mother-ai-backend-735112328456.asia-northeast1.run.app/health

# 認証エンドポイント（テスト）
curl -X POST https://mother-ai-backend-735112328456.asia-northeast1.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**期待される結果**:
- ルート: `{"message": "マザーAI API", "version": "0.1.0", "status": "running"}`
- 認証: 適切なエラーメッセージまたは成功レスポンス（500エラーではない）

#### 5.2 フロントエンドの確認

ブラウザで以下にアクセス：
```
https://frontend-7b8pescz6-wlicenses-projects.vercel.app/login
```

**確認項目**:
- ログインフォームが表示される
- ログイン試行時に500エラーが出ない
- 適切なエラーメッセージが表示される

---

## 📋 チェックリスト

### Google Cloud Run環境変数
- [ ] DATABASE_URL 設定済み
- [ ] SECRET_KEY 設定済み（32文字以上）
- [ ] ALLOWED_ORIGINS 本番URL設定済み
- [ ] DEBUG=false 設定済み
- [ ] PORT=8080 設定済み
- [ ] メール設定完了（オプション）
- [ ] OAuth設定完了（オプション）

### Vercel環境変数
- [ ] VITE_API_URL 本番バックエンドURL設定済み

### データベース
- [ ] Neon/Supabase接続文字列取得済み
- [ ] データベースが起動している
- [ ] テーブルが作成されている

### デプロイ
- [ ] Google Cloud Run再デプロイ完了
- [ ] Vercel再デプロイ完了

### 動作確認
- [ ] バックエンドルートエンドポイント正常
- [ ] バックエンド認証エンドポイント正常
- [ ] フロントエンドからAPIアクセス正常
- [ ] ログイン機能正常

---

## 🚨 トラブルシューティング

### 問題: DATABASE_URLを設定しても500エラーが出る

**原因**: データベースにテーブルが作成されていない

**対処**:
```bash
# ローカルでマイグレーション実行
cd backend
alembic upgrade head

# または手動でテーブル作成
python -c "from app.database import engine, Base; from app.models import models; Base.metadata.create_all(bind=engine)"
```

### 問題: CORS エラーが出る

**原因**: ALLOWED_ORIGINS が正しく設定されていない

**対処**:
```bash
# Google Cloud Runの環境変数を確認
ALLOWED_ORIGINS=["https://frontend-7b8pescz6-wlicenses-projects.vercel.app"]
```

**注意**: JSON配列形式で設定する必要があります。

### 問題: JWT エラーが出る

**原因**: SECRET_KEY が設定されていない、または短すぎる

**対処**:
```bash
# 32文字以上のランダム文字列を生成
openssl rand -hex 32

# 出力をSECRET_KEYに設定
```

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Google Cloud Runのログ確認
   ```bash
   gcloud run logs read mother-ai-backend --region asia-northeast1 --limit 50
   ```

2. Vercelのログ確認
   ```
   https://vercel.com/wlicenses-projects/frontend/deployments
   ```

3. データベース接続テスト
   ```bash
   # ローカルで接続テスト
   psql $DATABASE_URL
   ```

---

**作成日**: 2025-11-09
**最終更新**: 2025-11-09
**ステータス**: 修正作業待ち
