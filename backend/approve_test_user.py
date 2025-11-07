#!/usr/bin/env python3
"""E2Eテストユーザーを承認するスクリプト"""

import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import Session
from app.models.models import User
from app.core.config import settings

def approve_test_users():
    """E2Eテストユーザーを承認済みステータスに変更"""

    # データベースエンジンを作成
    engine = create_engine(settings.DATABASE_URL)

    with Session(engine) as session:
        # e2etest@example.comユーザーを検索
        user = session.execute(
            select(User).where(User.email == "e2etest@example.com")
        ).scalar_one_or_none()

        if user:
            print(f"Found user: {user.email} (Status: {user.status})")

            if user.status != "approved":
                # ステータスを承認済みに変更
                user.status = "approved"
                session.commit()
                print(f"✅ User {user.email} approved successfully!")
            else:
                print(f"✓ User {user.email} is already approved")
        else:
            print("❌ User e2etest@example.com not found in database")
            print("\nTrying to create new user...")

            # ユーザーが存在しない場合は作成
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

            new_user = User(
                email="e2etest@example.com",
                name="E2E Test User",
                hashed_password=pwd_context.hash("DevTest2025!"),
                status="approved",  # 直接承認済みで作成
                is_admin=False
            )

            session.add(new_user)
            session.commit()
            print(f"✅ Created and approved user: {new_user.email}")

if __name__ == "__main__":
    try:
        approve_test_users()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
