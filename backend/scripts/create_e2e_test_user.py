"""
E2Eテスト用の一般ユーザー作成スクリプト
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserStatus, UserRole

def create_e2e_test_user():
    """E2Eテスト用の一般ユーザーを作成"""
    db: Session = SessionLocal()

    try:
        # 既存ユーザーを確認
        existing_user = db.query(User).filter(User.email == "e2etest@example.com").first()

        if existing_user:
            print("✓ E2Eテストユーザーは既に存在しています")
            print(f"  ID: {existing_user.id}")
            print(f"  Email: {existing_user.email}")
            print(f"  Status: {existing_user.status.value}")
            return

        # 新規ユーザー作成
        test_user = User(
            email="e2etest@example.com",
            name="E2Eテストユーザー",
            hashed_password=get_password_hash("DevTest2025!"),
            role=UserRole.user,
            status=UserStatus.approved,
            application_purpose="E2Eテスト用の承認済み一般ユーザー"
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("✓ E2Eテストユーザーを作成しました:")
        print(f"  ID: {test_user.id}")
        print(f"  Email: {test_user.email}")
        print(f"  Name: {test_user.name}")
        print(f"  Role: {test_user.role.value}")
        print(f"  Status: {test_user.status.value}")
        print(f"  Password: DevTest2025!")

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_e2e_test_user()
