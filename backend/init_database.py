"""
データベース初期化スクリプト
本番環境で最初にデータベースを初期化する際に実行
"""
import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import models
from sqlalchemy import text


def init_database():
    """データベースを初期化（全テーブル作成）"""
    print("🔧 データベース初期化中...")

    try:
        # 接続テスト
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✓ データベース接続成功")

        # テーブル作成
        print("📋 テーブル作成中...")
        Base.metadata.create_all(bind=engine)
        print("✓ テーブル作成完了")

        # 作成されたテーブル一覧を表示
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
            )
            tables = [row[0] for row in result]
            print(f"\n作成されたテーブル ({len(tables)}個):")
            for table in tables:
                print(f"  - {table}")

        print("\n✅ データベース初期化完了")
        return True

    except Exception as e:
        print(f"\n❌ データベース初期化エラー: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
