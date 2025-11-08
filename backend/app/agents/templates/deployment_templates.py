"""
デプロイテンプレート
Phase 3で使用する実用的なデプロイスクリプト集
"""

from typing import Dict


def generate_deployment_scripts(project_name: str = "My App") -> Dict[str, str]:
    """
    デプロイスクリプトを生成

    Args:
        project_name: プロジェクト名

    Returns:
        デプロイスクリプトの辞書
    """
    safe_name = project_name.lower().replace(" ", "-").replace("_", "-")

    scripts = {
        "deploy.sh": f'''#!/bin/bash
set -e

# マザーAI - デプロイスクリプト
# プロジェクト: {project_name}

echo "🚀 {project_name} のデプロイを開始します..."

# 環境変数チェック
if [ ! -f .env.production ]; then
    echo "❌ .env.production ファイルが見つかりません"
    echo "📝 .env.production.template を参考に作成してください"
    exit 1
fi

# フロントエンドをVercelにデプロイ
echo "📦 フロントエンドをVercelにデプロイ中..."
cd frontend
if command -v vercel &> /dev/null; then
    vercel --prod
    echo "✅ フロントエンドのデプロイ完了"
else
    echo "⚠️  Vercel CLIがインストールされていません"
    echo "📝 npm install -g vercel でインストールしてください"
    cd ..
    exit 1
fi
cd ..

# バックエンドをGoogle Cloud Runにデプロイ
echo "📦 バックエンドをCloud Runにデプロイ中..."
cd backend

# GCPプロジェクトIDを取得
GCP_PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$GCP_PROJECT_ID" ]; then
    echo "❌ GCPプロジェクトが設定されていません"
    echo "📝 gcloud config set project YOUR_PROJECT_ID を実行してください"
    cd ..
    exit 1
fi

# Dockerイメージをビルド
echo "🔨 Dockerイメージをビルド中..."
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/{safe_name}-backend

# Cloud Runにデプロイ
echo "🚀 Cloud Runにデプロイ中..."
gcloud run deploy {safe_name}-backend \\
    --image gcr.io/$GCP_PROJECT_ID/{safe_name}-backend \\
    --platform managed \\
    --region asia-northeast1 \\
    --allow-unauthenticated \\
    --set-env-vars-file .env.production

echo "✅ バックエンドのデプロイ完了"
cd ..

echo ""
echo "🎉 {project_name} のデプロイが完了しました！"
echo ""
echo "📍 デプロイ先URL:"
echo "  - フロントエンド: https://$(vercel ls 2>/dev/null | grep {safe_name} | head -1 | awk '{{print $2}}')"
echo "  - バックエンド: https://{safe_name}-backend-$(gcloud config get-value project | tr '[:upper:]' '[:lower:]').run.app"
echo ""
''',

        "vercel.json": f'''{{\n  "version": 2,
  "name": "{safe_name}-frontend",
  "builds": [
    {{
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {{
        "distDir": "dist"
      }}
    }}
  ],
  "routes": [
    {{
      "src": "/api/(.*)",
      "dest": "${{VITE_API_BASE_URL}}/api/$1"
    }},
    {{
      "src": "/(.*)",
      "dest": "/index.html"
    }}
  ],
  "env": {{
    "VITE_API_BASE_URL": "@vite_api_base_url"
  }}
}}''',

        ".env.production.template": f'''# フロントエンド環境変数
VITE_API_BASE_URL=https://{safe_name}-backend-YOUR_PROJECT_ID.run.app

# バックエンド環境変数
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/{safe_name}
SECRET_KEY=GENERATE_SECURE_RANDOM_KEY_HERE
CORS_ORIGINS=https://{safe_name}.vercel.app,https://www.{safe_name}.com

# Google Cloud設定
GCP_PROJECT_ID=YOUR_GCP_PROJECT_ID

# Vercel設定
VERCEL_TOKEN=YOUR_VERCEL_TOKEN
''',

        "Dockerfile": '''# マザーAI - バックエンドDockerfile
FROM python:3.12-slim

# 作業ディレクトリ
WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y \\
    gcc \\
    postgresql-client \\
    && rm -rf /var/lib/apt/lists/*

# Python依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Uvicornでアプリケーションを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
''',

        ".github/workflows/deploy.yml": f'''name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm install

      - name: Build
        run: |
          cd frontend
          npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{{{ secrets.VERCEL_TOKEN }}}}
          vercel-org-id: ${{{{ secrets.VERCEL_ORG_ID }}}}
          vercel-project-id: ${{{{ secrets.VERCEL_PROJECT_ID }}}}
          vercel-args: '--prod'
          working-directory: ./frontend

  deploy-backend:
    name: Deploy Backend to Cloud Run
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Google Cloud CLI
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{{{ secrets.GCP_SA_KEY }}}}
          project_id: ${{{{ secrets.GCP_PROJECT_ID }}}}

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker

      - name: Build and Push Docker image
        run: |
          cd backend
          gcloud builds submit --tag gcr.io/${{{{ secrets.GCP_PROJECT_ID }}}}/{safe_name}-backend

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy {safe_name}-backend \\
            --image gcr.io/${{{{ secrets.GCP_PROJECT_ID }}}}/{safe_name}-backend \\
            --platform managed \\
            --region asia-northeast1 \\
            --allow-unauthenticated \\
            --set-env-vars DATABASE_URL=${{{{ secrets.DATABASE_URL }}}},SECRET_KEY=${{{{ secrets.SECRET_KEY }}}}
''',

        ".github/workflows/test.yml": '''name: Run Tests

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - develop

jobs:
  test-frontend:
    name: Frontend Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm install

      - name: Run type check
        run: |
          cd frontend
          npm run type-check

      - name: Run tests
        run: |
          cd frontend
          npm run test

  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          cd backend
          pytest --cov=app tests/
''',

        "README_DEPLOY.md": f'''# {project_name} - デプロイ手順書

このドキュメントは「マザーAI」によって生成されました。

## 📋 前提条件

### 必要なツール
- Node.js 20以上
- Python 3.12以上
- Docker
- Google Cloud SDK
- Vercel CLI

### アカウント
- Vercel アカウント
- Google Cloud Platform アカウント
- PostgreSQL データベース（Supabase / Neon推奨）

## 🚀 デプロイ手順

### 1. 環境変数の設定

`.env.production.template` をコピーして `.env.production` を作成し、必要な値を設定してください。

```bash
cp .env.production.template .env.production
```

必須の環境変数:
- `DATABASE_URL`: PostgreSQL接続URL
- `SECRET_KEY`: JWT秘密鍵（ランダムな文字列を生成）
- `GCP_PROJECT_ID`: Google Cloudプロジェクトのdocument.getElementById
- `VERCEL_TOKEN`: Vercelアクセストークン

### 2. Google Cloudの設定

```bash
# GCPプロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# Cloud Run APIを有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Vercel CLIのインストールと認証

```bash
npm install -g vercel
vercel login
```

### 4. デプロイの実行

```bash
# デプロイスクリプトに実行権限を付与
chmod +x deploy.sh

# デプロイを実行
./deploy.sh
```

## 🔄 CI/CDの設定（GitHub Actions）

### 必要なシークレット

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

**Vercel:**
- `VERCEL_TOKEN`: Vercelアクセストークン
- `VERCEL_ORG_ID`: Vercel組織ID
- `VERCEL_PROJECT_ID`: VercelプロジェクトID

**Google Cloud:**
- `GCP_SA_KEY`: サービスアカウントキー（JSON形式）
- `GCP_PROJECT_ID`: GCPプロジェクトID

**環境変数:**
- `DATABASE_URL`: データベース接続URL
- `SECRET_KEY`: JWT秘密鍵

### 自動デプロイの流れ

1. `main`ブランチにpush → 本番環境へ自動デプロイ
2. プルリクエスト作成 → テスト自動実行

## 🔍 デプロイ確認

デプロイ完了後、以下のURLで確認できます:

- **フロントエンド**: `https://{safe_name}.vercel.app`
- **バックエンドAPI**: `https://{safe_name}-backend-YOUR_PROJECT_ID.run.app`
- **API ドキュメント**: `https://{safe_name}-backend-YOUR_PROJECT_ID.run.app/docs`

## 🛠️ トラブルシューティング

### デプロイが失敗する

1. 環境変数が正しく設定されているか確認
2. Google Cloudの課金が有効か確認
3. Vercelのビルドログを確認

### データベース接続エラー

1. `DATABASE_URL` が正しいか確認
2. データベースが起動しているか確認
3. IPホワイトリストの設定を確認（Cloud RunのIPを許可）

### CORS エラー

1. バックエンドの `CORS_ORIGINS` にフロントエンドURLが含まれているか確認
2. 環境変数が正しくデプロイされているか確認

## 📞 サポート

問題が解決しない場合は、以下を確認してください:
- Cloud Runのログ: `gcloud run logs read`
- Vercelのデプロイログ: Vercel Dashboard

---

*このドキュメントは「マザーAI」Phase 3エージェントによって自動生成されました。*
''',

        ".dockerignore": '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv

# Environment
.env
.env.local
.env.production

# Testing
.pytest_cache/
.coverage
htmlcov/

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Git
.git/
.gitignore

# Docs
README.md
docs/

# Misc
*.log
.DS_Store
''',

        "DEPLOYMENT_CHECKLIST.md": f'''# {project_name} - デプロイチェックリスト

## デプロイ前の確認

- [ ] `.env.production` ファイルを作成
- [ ] すべての環境変数を設定
- [ ] データベースのマイグレーション実行済み
- [ ] Google Cloud Platformプロジェクト作成済み
- [ ] Vercelプロジェクト作成済み
- [ ] ドメイン設定（カスタムドメインを使用する場合）

## セキュリティチェック

- [ ] `SECRET_KEY` はランダムな文字列を使用
- [ ] データベースパスワードは強固なものを使用
- [ ] APIキーやトークンを`.env`ファイルに保存（コミットしない）
- [ ] CORSオリジンを本番URLに限定
- [ ] HTTPSを強制

## パフォーマンスチェック

- [ ] フロントエンドのビルドサイズを確認
- [ ] データベースインデックスを設定
- [ ] Cloud Runのメモリ・CPU設定を最適化
- [ ] CDNキャッシュ設定（Vercel）

## デプロイ後の確認

- [ ] フロントエンドが正常に表示される
- [ ] バックエンドAPIが応答する
- [ ] データベース接続が正常
- [ ] 認証機能が動作する
- [ ] APIドキュメントにアクセスできる
- [ ] エラーログに異常がない
- [ ] モニタリング設定（Google Cloud Monitoring）

## ロールバック手順

問題が発生した場合:

1. Vercel: ダッシュボードから前のデプロイに戻す
2. Cloud Run: 以前のリビジョンにトラフィックを振り分け

```bash
# Cloud Runで前のリビジョンに戻す
gcloud run services update-traffic {safe_name}-backend \\
    --to-revisions=REVISION_NAME=100
```

---

*このチェックリストは「マザーAI」によって生成されました。*
''',
    }

    return scripts
