# デプロイ前チェックリスト

このチェックリストは、本番環境へのデプロイ前に確認すべき項目をまとめたものです。

---

## Phase 11: デプロイ準備（完了）

### 設定ファイル準備 ✅

- [x] **frontend/vercel.json** 作成完了
  - ビルド設定
  - リライトルール（SPA対応）
  - セキュリティヘッダー
  - キャッシュ設定

- [x] **backend/Dockerfile** 作成完了
  - マルチステージビルド
  - 非rootユーザー実行
  - ヘルスチェック設定
  - 環境変数設定

- [x] **backend/.dockerignore** 作成完了
  - 不要ファイル除外
  - セキュリティファイル除外

- [x] **.github/workflows/ci-cd.yml** 作成完了
  - フロントエンドCI/CD
  - バックエンドCI/CD
  - 自動テスト
  - 自動デプロイ

- [x] **docs/DEPLOYMENT.md** 作成完了
  - 環境変数説明
  - デプロイ手順
  - トラブルシューティング

---

## Phase 12: 本番デプロイ前チェック（次のフェーズ）

### 1. コード品質チェック

#### フロントエンド
- [ ] TypeScriptエラー: 0件
  ```bash
  cd frontend && npx tsc --noEmit
  ```

- [ ] ESLint警告: 0件
  ```bash
  cd frontend && npm run lint
  ```

- [ ] ビルド成功
  ```bash
  cd frontend && npm run build
  ```

- [ ] E2Eテスト成功
  ```bash
  cd frontend && npx playwright test
  ```

#### バックエンド
- [ ] Python構文エラー: 0件
  ```bash
  cd backend && python -m py_compile $(find . -name "*.py")
  ```

- [ ] 型ヒントチェック（オプション）
  ```bash
  cd backend && mypy app/ || echo "型チェックスキップ"
  ```

- [ ] Dockerビルド成功
  ```bash
  cd backend && docker build -t test-backend .
  ```

---

### 2. セキュリティチェック

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] APIキーがハードコードされていない
- [ ] JWT秘密鍵が安全に管理されている
- [ ] パスワードがハッシュ化されている（bcrypt）
- [ ] CORS設定が適切
- [ ] SQLインジェクション対策（ORM使用）
- [ ] XSS対策（React自動エスケープ）

---

### 3. 環境変数準備

#### フロントエンド（Vercel）
- [ ] `VITE_API_BASE_URL`: 本番バックエンドURL設定

#### バックエンド（Google Cloud Run）
- [ ] `DATABASE_URL`: Neon PostgreSQL接続文字列
- [ ] `JWT_SECRET`: ランダム生成された秘密鍵（64文字以上推奨）
- [ ] `CLAUDE_API_KEY`: Claude API キー
- [ ] `JWT_ALGORITHM`: HS256
- [ ] `JWT_EXPIRATION_HOURS`: 24
- [ ] `APP_ENV`: production
- [ ] `CORS_ORIGINS`: フロントエンドURL（Vercel）

---

### 4. データベース準備

- [ ] Neon PostgreSQLアカウント作成
- [ ] データベース作成
- [ ] マイグレーション実行
  ```bash
  cd backend
  alembic upgrade head
  ```
- [ ] 初期データ投入（必要に応じて）
- [ ] バックアップ設定確認

---

### 5. 外部サービスアカウント準備

#### Vercel
- [ ] アカウント作成
- [ ] GitHubリポジトリ接続
- [ ] プロジェクト作成
- [ ] 環境変数設定

#### Google Cloud Platform
- [ ] アカウント作成
- [ ] プロジェクト作成
- [ ] 課金設定確認（無料枠内）
- [ ] 必要なAPI有効化
  - Cloud Run API
  - Container Registry API
  - Cloud Build API
- [ ] サービスアカウント作成

#### GitHub
- [ ] リポジトリ作成
- [ ] Secrets設定
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `GCP_CREDENTIALS`
  - `GCP_PROJECT_ID`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CLAUDE_API_KEY`

---

### 6. デプロイ実行前の最終確認

#### ⚠️ 料金発生確認（最重要）

**フロントエンド（Vercel）**
- [ ] 無料枠の制限を確認
  - 月間100GB帯域幅
  - 月間1000回ビルド
- [ ] 課金設定がないことを確認
- [ ] デプロイ料金が発生しないことを確認

**バックエンド（Google Cloud Run）**
- [ ] 無料枠の制限を確認
  - 月間200万リクエスト
  - 月間360,000 vCPU秒
  - 月間180,000 GiB秒
- [ ] 予算アラート設定（$10/月）
- [ ] 課金上限設定（オプション）

**データベース（Neon PostgreSQL）**
- [ ] 無料枠の制限を確認
  - 0.5 GBストレージ
  - 10 GBデータ転送/月

#### ユーザー承認プロセス

```
⚠️⚠️⚠️ デプロイ実行前の必須手順 ⚠️⚠️⚠️

1. ユーザーに料金発生の可能性を通知
   - Vercel無料枠: 月間100GB帯域幅、1000回ビルド
   - GCP無料枠: 月間200万リクエスト
   - Neon無料枠: 0.5GB、10GB転送/月

2. ユーザーの了承を得る
   「上記の無料枠内でデプロイを実行してよろしいですか？」

3. ダブルチェック
   「本当に宜しいですか？デプロイを開始します。」

4. 承認を得てから実行
```

---

### 7. デプロイ実行

#### フロントエンド
```bash
cd frontend
vercel --prod
```

#### バックエンド
```bash
# Dockerビルド
cd backend
docker build -t gcr.io/PROJECT_ID/mother-ai-backend:latest .

# GCRにプッシュ
docker push gcr.io/PROJECT_ID/mother-ai-backend:latest

# Cloud Runにデプロイ
gcloud run deploy mother-ai-backend \
  --image gcr.io/PROJECT_ID/mother-ai-backend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="...",JWT_SECRET="...",CLAUDE_API_KEY="..."
```

---

### 8. デプロイ後確認

#### 動作確認
- [ ] フロントエンドアクセス可能
- [ ] バックエンドヘルスチェック成功
  ```bash
  curl https://your-backend.run.app/health
  ```
- [ ] ログインテスト
- [ ] プロジェクト作成テスト
- [ ] AI対話テスト

#### 監視設定
- [ ] GCP予算アラート設定
- [ ] Vercel使用状況確認
- [ ] エラーログ監視設定

---

## Phase 11完了基準

Phase 11（デプロイ準備）は以下が完了したら達成:

- [x] **設定ファイル作成**: vercel.json, Dockerfile, .dockerignore, ci-cd.yml
- [x] **ドキュメント作成**: DEPLOYMENT.md, DEPLOY_CHECKLIST.md
- [ ] **ローカルビルドテスト**: フロントエンド・バックエンド両方
- [ ] **Dockerイメージビルドテスト**: 正常にビルド＆起動できることを確認

---

## Phase 12実行タイミング

Phase 12（本番デプロイ）は以下の条件が揃った時のみ実行:

1. ✅ Phase 11完了
2. ✅ 全E2Eテスト成功
3. ✅ 料金発生リスク理解
4. ✅ ユーザー承認取得

---

**作成日**: 2025-11-07
**最終更新**: 2025-11-07
**現在のフェーズ**: Phase 11（デプロイ準備）
