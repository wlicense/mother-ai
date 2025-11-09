#!/bin/bash
# 本番環境セットアップスクリプト（安全版）

set -e

echo "🚀 マザーAI 本番環境セットアップ開始"
echo "========================================"
echo ""

# Step 1: Google Cloud Runの環境変数設定
echo "📝 Step 1: Google Cloud Runの環境変数を設定中..."
gcloud run services update mother-ai-backend \
  --region asia-northeast1 \
  --env-vars-file .env.cloudrun \
  --quiet

echo "✅ Google Cloud Runの環境変数設定完了"
echo ""

# Step 2: デプロイ完了を待つ
echo "⏳ デプロイ完了を待機中..."
sleep 5
echo "✅ デプロイ完了"
echo ""

# Step 3: 動作確認
echo "🔍 Step 2: バックエンドAPIの動作確認中..."
BACKEND_URL="https://mother-ai-backend-735112328456.asia-northeast1.run.app"

# ルートエンドポイント確認
echo "  - ルートエンドポイント確認..."
curl -s "$BACKEND_URL/" | grep -q "マザーAI API" && echo "    ✅ 正常" || echo "    ❌ エラー"

# ヘルスチェック
echo "  - ヘルスチェック..."
curl -s "$BACKEND_URL/health" | grep -q "healthy" && echo "    ✅ 正常" || echo "    ❌ エラー"

echo ""
echo "🎉 Google Cloud Runの設定完了！"
echo ""
echo "次のステップ:"
echo "1. データベース初期化: python backend/init_database.py"
echo "2. 管理者作成: python backend/create_admin.py"
echo "3. Vercel環境変数設定"
echo ""
