#!/usr/bin/env python3
"""E2Eテストプロジェクトをクリーンアップするスクリプト"""

import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.models import Project, User
from app.core.config import settings

def cleanup_test_projects():
    """E2Eテストユーザーの全プロジェクトを削除"""

    # データベースエンジンを作成
    engine = create_engine(settings.DATABASE_URL)

    with Session(engine) as session:
        # e2etest@example.comユーザーを検索
        user = session.execute(
            User.__table__.select().where(User.email == "e2etest@example.com")
        ).first()

        if user:
            print(f"Found user: {user.email}")

            # ユーザーのプロジェクトを全て取得
            projects = session.query(Project).filter(Project.owner_id == user.id).all()
            project_count = len(projects)

            print(f"Found {project_count} projects to delete")

            # 全て削除
            for project in projects:
                session.delete(project)

            session.commit()
            print(f"✅ Successfully deleted {project_count} projects!")
        else:
            print("❌ User e2etest@example.com not found in database")

if __name__ == "__main__":
    try:
        cleanup_test_projects()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
