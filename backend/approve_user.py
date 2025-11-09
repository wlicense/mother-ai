#!/usr/bin/env python3
"""
ユーザーを承認済みにするスクリプト
使い方: python approve_user.py
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import User, UserStatus
from app.core.config import settings

# データベース接続
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # 全ユーザーを取得
    users = db.query(User).all()

    print("=== 現在のユーザー一覧 ===\n")
    for user in users:
        print(f"ID: {user.id}")
        print(f"名前: {user.name}")
        print(f"メール: {user.email}")
        print(f"ステータス: {user.status.value}")
        print(f"役割: {user.role.value}")
        print("-" * 50)

    # pending状態のユーザーを全て承認
    pending_users = db.query(User).filter(User.status == UserStatus.pending).all()

    if pending_users:
        print(f"\n=== {len(pending_users)}人のユーザーを承認します ===\n")
        for user in pending_users:
            user.status = UserStatus.approved
            print(f"✅ {user.name} ({user.email}) を承認しました")

        db.commit()
        print("\n✅ 全ての変更をコミットしました！")
        print("\n再度ログインしてください。")
    else:
        print("\n✅ 承認待ちのユーザーはいません。")

except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
    db.rollback()
finally:
    db.close()
