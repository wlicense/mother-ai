"""
E2Eテスト用の初期データ投入スクリプト

テスト実行前にこのスクリプトを実行することで、テストに必要なユーザーデータを作成します。
"""

import sys
import os
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, UserRole, UserStatus
from app.core.security import get_password_hash


def seed_test_users(db: Session):
    """テストユーザーを作成"""

    # テストユーザーの定義
    test_users = [
        {
            "email": "e2etest@example.com",
            "password": "DevTest2025!",
            "name": "E2E Test User",
            "role": UserRole.user,
            "status": UserStatus.approved,
        },
        {
            "email": "admin@example.com",
            "password": "AdminTest2025!",
            "name": "Admin User",
            "role": UserRole.admin,
            "status": UserStatus.approved,
        },
        {
            "email": "pending1@example.com",
            "password": "Pending1Test2025!",
            "name": "Pending User 1",
            "role": UserRole.user,
            "status": UserStatus.pending,
            "application_purpose": "E2Eテスト用の申請データ1",
        },
        {
            "email": "pending2@example.com",
            "password": "Pending2Test2025!",
            "name": "Pending User 2",
            "role": UserRole.user,
            "status": UserStatus.pending,
            "application_purpose": "E2Eテスト用の申請データ2",
        },
        {
            "email": "pending3@example.com",
            "password": "Pending3Test2025!",
            "name": "Pending User 3",
            "role": UserRole.user,
            "status": UserStatus.pending,
            "application_purpose": "E2Eテスト用の申請データ3",
        },
    ]

    created_count = 0
    updated_count = 0

    for user_data in test_users:
        # 既存ユーザーを確認
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()

        if existing_user:
            # 既存ユーザーを更新
            existing_user.name = user_data["name"]
            existing_user.password_hash = get_password_hash(user_data["password"])
            existing_user.role = user_data["role"]
            existing_user.status = user_data["status"]
            if "application_purpose" in user_data:
                existing_user.application_purpose = user_data["application_purpose"]
            updated_count += 1
            print(f"✓ Updated: {user_data['email']} ({user_data['name']})")
        else:
            # 新規ユーザーを作成
            new_user = User(
                email=user_data["email"],
                name=user_data["name"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"],
                status=user_data["status"],
                application_purpose=user_data.get("application_purpose"),
            )
            db.add(new_user)
            created_count += 1
            print(f"✓ Created: {user_data['email']} ({user_data['name']})")

    db.commit()

    print(f"\n合計: {created_count}件作成, {updated_count}件更新")


def main():
    """メイン処理"""
    print("=" * 60)
    print("E2Eテスト用初期データ投入スクリプト")
    print("=" * 60)
    print()

    db = SessionLocal()

    try:
        seed_test_users(db)
        print()
        print("✅ テストデータの投入が完了しました")
        print()
        print("作成されたユーザー:")
        print("  - e2etest@example.com (approved user)")
        print("  - admin@example.com (admin)")
        print("  - pending1@example.com (pending)")
        print("  - pending2@example.com (pending)")
        print("  - pending3@example.com (pending)")
        print()
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
