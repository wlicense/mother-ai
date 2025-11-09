"""
管理者ユーザー作成スクリプト
本番環境で最初の管理者アカウントを作成
"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.models import User, Application
from app.core.security import get_password_hash
import uuid


def create_admin_user(
    email: str = "admin@motherai.local",
    password: str = "AdminTest2025!",
    name: str = "管理者"
):
    """
    管理者ユーザーを作成

    Args:
        email: 管理者メールアドレス
        password: 管理者パスワード
        name: 管理者名
    """
    db = SessionLocal()

    try:
        # 既存ユーザーをチェック
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️  ユーザー {email} は既に存在します")
            if existing_user.role == "admin":
                print("✓ 既に管理者権限があります")
                return True
            else:
                # 管理者権限に昇格
                existing_user.role = "admin"
                existing_user.status = "active"
                db.commit()
                print(f"✓ ユーザー {email} を管理者に昇格しました")
                return True

        # 新規管理者ユーザー作成
        print(f"📝 管理者ユーザー作成中: {email}")

        # Applicationレコード作成
        application = Application(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            password_hash=get_password_hash(password),
            purpose="システム管理者アカウント",
            status="approved",
            created_at=datetime.utcnow(),
        )
        db.add(application)
        db.flush()

        # Userレコード作成
        user = User(
            id=str(uuid.uuid4()),
            application_id=application.id,
            email=email,
            name=name,
            password_hash=get_password_hash(password),
            role="admin",
            status="active",
            created_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()

        print(f"✅ 管理者ユーザー作成完了")
        print(f"   メール: {email}")
        print(f"   パスワード: {password}")
        print(f"   役割: admin")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="管理者ユーザー作成")
    parser.add_argument("--email", default="admin@motherai.local", help="管理者メールアドレス")
    parser.add_argument("--password", default="AdminTest2025!", help="管理者パスワード")
    parser.add_argument("--name", default="管理者", help="管理者名")

    args = parser.parse_args()

    success = create_admin_user(
        email=args.email,
        password=args.password,
        name=args.name
    )

    sys.exit(0 if success else 1)
