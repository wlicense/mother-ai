"""
管理者ユーザー確認スクリプト
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User

def check_admin_user():
    """管理者ユーザーを確認"""
    db: Session = SessionLocal()

    try:
        # admin@example.com ユーザーを検索
        admin = db.query(User).filter(User.email == "admin@example.com").first()

        if admin:
            print("✓ 管理者ユーザーが見つかりました:")
            print(f"  ID: {admin.id}")
            print(f"  Email: {admin.email}")
            print(f"  Name: {admin.name}")
            print(f"  Role: {admin.role.value}")
            print(f"  Status: {admin.status.value}")
            print(f"  Hashed Password (first 30 chars): {admin.hashed_password[:30]}...")
        else:
            print("✗ admin@example.com ユーザーがデータベースに存在しません")

        # すべてのユーザーを表示
        print("\nデータベース内の全ユーザー:")
        users = db.query(User).all()
        for user in users:
            print(f"  - {user.email} (Role: {user.role.value}, Status: {user.status.value})")

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    check_admin_user()
