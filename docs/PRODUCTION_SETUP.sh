#!/bin/bash
# 本番環境セットアップスクリプト
# Google Cloud Runにデプロイ後、このスクリプトで初期設定を実行

set -e  # エラーで停止

echo "🚀 マザーAI 本番環境セットアップ"
echo "================================"
echo ""

# 環境変数チェック
check_env() {
    local var_name=$1
    if [ -z "${!var_name}" ]; then
        echo "❌ 環境変数 $var_name が設定されていません"
        return 1
    else
        echo "✓ $var_name: 設定済み"
        return 0
    fi
}

echo "📋 環境変数チェック..."
echo ""

# 必須環境変数
REQUIRED_VARS=(
    "DATABASE_URL"
    "SECRET_KEY"
    "CORS_ORIGINS"
)

all_set=true
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env "$var"; then
        all_set=false
    fi
done

if [ "$all_set" = false ]; then
    echo ""
    echo "❌ 必須環境変数が不足しています"
    echo "Google Cloud Runの環境変数設定を確認してください"
    exit 1
fi

echo ""
echo "✅ 環境変数チェック完了"
echo ""

# データベース初期化
echo "🔧 データベース初期化..."
echo ""

cd /app  # Cloud Runのワーキングディレクトリ

python init_database.py
if [ $? -ne 0 ]; then
    echo "❌ データベース初期化失敗"
    exit 1
fi

echo ""
echo "✅ データベース初期化完了"
echo ""

# 管理者ユーザー作成
echo "👤 管理者ユーザー作成..."
echo ""

python create_admin.py --email "admin@motherai.local" --password "AdminTest2025!" --name "管理者"
if [ $? -ne 0 ]; then
    echo "⚠️  管理者ユーザー作成スキップ（既に存在する可能性があります）"
fi

echo ""
echo "🎉 セットアップ完了！"
echo ""
echo "次のステップ:"
echo "1. ブラウザで https://[YOUR_FRONTEND_URL] にアクセス"
echo "2. 管理者でログイン: admin@motherai.local / AdminTest2025!"
echo "3. 初期設定を完了"
echo ""
