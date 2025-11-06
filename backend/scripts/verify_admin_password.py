"""
管理者ユーザーのパスワード検証スクリプト
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import verify_password
from app.models.models import User

def verify_admin_password():
    """管理者ユーザーのパスワードを検証"""
    db: Session = SessionLocal()

    try:
        # admin@example.com ユーザーを検索
        admin = db.query(User).filter(User.email == "admin@example.com").first()

        if not admin:
            print("✗ admin@example.com ユーザーがデータベースに存在しません")
            return

        print("✓ 管理者ユーザーが見つかりました:")
        print(f"  Email: {admin.email}")
        print(f"  Hashed Password: {admin.hashed_password[:50]}...")

        # パスワードを検証
        test_password = "AdminTest2025!"
        print(f"\nテストパスワード: {test_password}")

        is_valid = verify_password(test_password, admin.hashed_password)

        if is_valid:
            print("✓ パスワードは正しいです！")
        else:
            print("✗ パスワードが一致しません")

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    verify_admin_password()
