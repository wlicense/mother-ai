"""
E2Eテスト用のPending状態ユーザー作成スクリプト
申請承認・却下テスト用
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserStatus, UserRole

def create_pending_test_users():
    """E2Eテスト用のPending状態ユーザーを作成"""
    db: Session = SessionLocal()

    pending_users = [
        {
            "email": "pending1@example.com",
            "name": "承認テストユーザー1",
            "password": "Test2025!",
            "purpose": "E2Eテスト用 - 承認テスト"
        },
        {
            "email": "pending2@example.com",
            "name": "却下テストユーザー2",
            "password": "Test2025!",
            "purpose": "E2Eテスト用 - 却下テスト"
        },
        {
            "email": "pending3@example.com",
            "name": "承認待ちテストユーザー3",
            "password": "Test2025!",
            "purpose": "E2Eテスト用 - 一覧表示テスト"
        }
    ]

    try:
        created_count = 0
        existing_count = 0

        for user_data in pending_users:
            # 既存ユーザーを確認
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()

            if existing_user:
                existing_count += 1
                print(f"⚠ {user_data['email']} は既に存在しています (Status: {existing_user.status.value})")

                # Pending以外の状態ならPendingに戻す
                if existing_user.status != UserStatus.pending:
                    existing_user.status = UserStatus.pending
                    existing_user.rejection_reason = None
                    db.commit()
                    print(f"  → ステータスをpendingに変更しました")
                continue

            # 新規ユーザー作成
            new_user = User(
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=UserRole.user,
                status=UserStatus.pending,
                application_purpose=user_data["purpose"]
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            created_count += 1
            print(f"✓ {user_data['name']} を作成しました:")
            print(f"  Email: {user_data['email']}")
            print(f"  ID: {new_user.id}")
            print(f"  Status: {new_user.status.value}")

        print(f"\n" + "="*50)
        print(f"作成: {created_count}件, 既存: {existing_count}件")
        print(f"="*50)

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_pending_test_users()
