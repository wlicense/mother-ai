"""
管理者ユーザー作成スクリプト

E2Eテスト用の管理者ユーザーを作成します。
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.models import User, UserStatus, UserRole


def create_admin_user():
    """管理者ユーザーを作成"""
    db: Session = SessionLocal()

    try:
        # 既存の管理者ユーザーを確認
        existing_admin = db.query(User).filter(User.email == "admin@motherai.local").first()

        if existing_admin:
            print("✓ 管理者ユーザーは既に存在します")
            print(f"  - Email: {existing_admin.email}")
            print(f"  - Name: {existing_admin.name}")
            print(f"  - Role: {existing_admin.role.value}")
            print(f"  - Status: {existing_admin.status.value}")
            return existing_admin

        # 管理者ユーザーを作成
        admin_user = User(
            email="admin@motherai.local",
            name="管理者ユーザー",
            hashed_password=get_password_hash("AdminTest2025!"),
            role=UserRole.admin,
            status=UserStatus.approved,
            application_purpose="E2Eテスト用の管理者アカウント",
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("✓ 管理者ユーザーを作成しました")
        print(f"  - Email: admin@motherai.local")
        print(f"  - Password: AdminTest2025!")
        print(f"  - Name: 管理者ユーザー")
        print(f"  - Role: admin")
        print(f"  - Status: approved")

        return admin_user

    except Exception as e:
        print(f"✗ エラーが発生しました: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("管理者ユーザー作成スクリプト")
    print("=" * 60)
    print()

    # データベーステーブルを作成
    print("Step 1: データベーステーブルを作成中...")
    init_db()
    print("✓ データベーステーブルを作成しました")
    print()

    # 管理者ユーザーを作成
    print("Step 2: 管理者ユーザーを作成中...")
    create_admin_user()

    print()
    print("=" * 60)
    print("完了")
    print("=" * 60)
