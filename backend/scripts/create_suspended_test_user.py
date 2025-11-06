"""
E2Eテスト用のSuspended状態ユーザー作成スクリプト
停止中ユーザーログインテスト用
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserStatus, UserRole

def create_suspended_test_user():
    """E2Eテスト用のSuspended状態ユーザーを作成"""
    db: Session = SessionLocal()

    user_data = {
        "email": "suspended@example.com",
        "name": "停止中テストユーザー",
        "password": "Test2025!",
        "purpose": "E2Eテスト用 - 停止中ユーザーログインテスト"
    }

    try:
        # 既存ユーザーを確認
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()

        if existing_user:
            print(f"⚠ {user_data['email']} は既に存在しています (Status: {existing_user.status.value})")

            # Suspended以外の状態ならSuspendedに変更
            if existing_user.status != UserStatus.suspended:
                existing_user.status = UserStatus.suspended
                db.commit()
                print(f"  → ステータスをsuspendedに変更しました")
            return

        # 新規ユーザー作成
        new_user = User(
            email=user_data["email"],
            name=user_data["name"],
            hashed_password=get_password_hash(user_data["password"]),
            role=UserRole.user,
            status=UserStatus.suspended,
            application_purpose=user_data["purpose"]
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"✓ {user_data['name']} を作成しました:")
        print(f"  Email: {user_data['email']}")
        print(f"  ID: {new_user.id}")
        print(f"  Status: {new_user.status.value}")

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_suspended_test_user()
