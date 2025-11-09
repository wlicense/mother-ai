from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_approved_user
from app.models.models import User, Project, ProjectStatus, Message, ProjectFile
from app.services.claude_service import get_claude_service

router = APIRouter()


class CreateProjectRequest(BaseModel):
    name: str
    description: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    status: str
    current_phase: int
    created_at: str


class SendMessageRequest(BaseModel):
    content: str
    phase: int


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクト一覧を取得
    """
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description or "",
            "status": p.status.value,
            "current_phase": p.current_phase,
            "created_at": p.created_at.isoformat(),
        }
        for p in projects
    ]


@router.post("", response_model=ProjectResponse)
async def create_project(
    request: CreateProjectRequest,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    新規プロジェクトを作成
    """
    new_project = Project(
        name=request.name,
        description=request.description,
        owner_id=current_user.id,
        status=ProjectStatus.active,
        current_phase=1,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description or "",
        "status": new_project.status.value,
        "current_phase": new_project.current_phase,
        "created_at": new_project.created_at.isoformat(),
    }


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクト詳細を取得
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # メッセージ履歴を取得
    messages = db.query(Message).filter(Message.project_id == project_id).order_by(Message.created_at).all()

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status.value,
        "current_phase": project.current_phase,
        "created_at": project.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "phase": m.phase,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }


@router.post("/{project_id}/messages")
async def send_message(
    project_id: str,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクトにメッセージを送信し、AIからの応答をSSEストリーミングで取得
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # ユーザーのメッセージを保存
    user_message = Message(
        project_id=project_id,
        phase=request.phase,
        role="user",
        content=request.content,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # メッセージ履歴を取得（Claude APIに送信）
    messages = db.query(Message).filter(
        Message.project_id == project_id,
        Message.phase == request.phase
    ).order_by(Message.created_at).all()

    # Claude API形式に変換
    claude_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
        if msg.role in ["user", "assistant"]
    ]

    # SSEストリーミング
    async def event_stream():
        """Server-Sent Eventsストリーム"""
        try:
            # 開始イベント
            yield f"data: {json.dumps({'type': 'start'})}\n\n"

            # Phase Agentsのモックロジックを使用（Claude API課金を避けるため）
            from app.agents.phase_agents import (
                Phase1RequirementsAgent,
                Phase2CodeGenerationAgent,
                Phase3DeploymentAgent,
                Phase4SelfImprovementAgent
            )
            from app.agents.extended_phase_agents import (
                Phase5TestGenerationAgent,
                Phase6DocumentationAgent,
                Phase7DebugAgent,
                Phase8PerformanceAgent,
                Phase9SecurityAgent,
                Phase10DatabaseAgent,
                Phase11APIDesignAgent,
                Phase12UXAgent,
                Phase13RefactoringAgent,
                Phase14MonitoringAgent
            )

            # Phaseに応じてエージェントを選択
            agent_map = {
                1: Phase1RequirementsAgent(),
                2: Phase2CodeGenerationAgent(),
                3: Phase3DeploymentAgent(),
                4: Phase4SelfImprovementAgent(),
                5: Phase5TestGenerationAgent(),
                6: Phase6DocumentationAgent(),
                7: Phase7DebugAgent(),
                8: Phase8PerformanceAgent(),
                9: Phase9SecurityAgent(),
                10: Phase10DatabaseAgent(),
                11: Phase11APIDesignAgent(),
                12: Phase12UXAgent(),
                13: Phase13RefactoringAgent(),
                14: Phase14MonitoringAgent(),
            }

            agent = agent_map.get(request.phase, Phase1RequirementsAgent())

            # エージェントを実行
            result = await agent.execute({
                "user_message": request.content,
                "project_context": {
                    "project_id": project_id,
                    "project_name": project.name,
                },
            })

            full_response = result.get("response", "応答がありませんでした。")

            # 応答を文字単位でストリーミング（リアルタイム感を出すため）
            import asyncio
            for char in full_response:
                yield f"data: {json.dumps({'type': 'token', 'content': char})}\n\n"
                await asyncio.sleep(0.01)  # 少し遅延を入れてリアルタイム感を出す

            # AIの応答をDBに保存
            assistant_message = Message(
                project_id=project_id,
                phase=request.phase,
                role="assistant",
                content=full_response,
            )
            db.add(assistant_message)
            db.commit()

            # Phase 2の場合、生成されたコードをProjectFileテーブルに自動保存
            if request.phase == 2 and "generated_code" in result:
                generated_code = result.get("generated_code", {})

                # フロントエンドコードを保存
                for file_path, content in generated_code.get("frontend", {}).items():
                    # 言語を推定
                    language = None
                    if file_path.endswith('.tsx') or file_path.endswith('.ts'):
                        language = 'typescript'
                    elif file_path.endswith('.jsx') or file_path.endswith('.js'):
                        language = 'javascript'
                    elif file_path.endswith('.css'):
                        language = 'css'
                    elif file_path.endswith('.json'):
                        language = 'json'
                    elif file_path.endswith('.html'):
                        language = 'html'

                    # 既存ファイルを検索
                    existing_file = db.query(ProjectFile).filter(
                        ProjectFile.project_id == project_id,
                        ProjectFile.file_path == f"frontend/{file_path}"
                    ).first()

                    if existing_file:
                        # 更新
                        existing_file.content = content
                        existing_file.language = language
                        existing_file.updated_at = datetime.utcnow()
                    else:
                        # 新規作成
                        new_file = ProjectFile(
                            project_id=project_id,
                            file_path=f"frontend/{file_path}",
                            content=content,
                            language=language,
                        )
                        db.add(new_file)

                # バックエンドコードを保存
                for file_path, content in generated_code.get("backend", {}).items():
                    # 言語を推定
                    language = None
                    if file_path.endswith('.py'):
                        language = 'python'
                    elif file_path.endswith('.txt'):
                        language = 'plaintext'

                    # 既存ファイルを検索
                    existing_file = db.query(ProjectFile).filter(
                        ProjectFile.project_id == project_id,
                        ProjectFile.file_path == f"backend/{file_path}"
                    ).first()

                    if existing_file:
                        # 更新
                        existing_file.content = content
                        existing_file.language = language
                        existing_file.updated_at = datetime.utcnow()
                    else:
                        # 新規作成
                        new_file = ProjectFile(
                            project_id=project_id,
                            file_path=f"backend/{file_path}",
                            content=content,
                            language=language,
                        )
                        db.add(new_file)

                db.commit()

            # 完了イベント
            yield f"data: {json.dumps({'type': 'end', 'messageId': assistant_message.id})}\n\n"

        except Exception as e:
            # エラーイベント
            error_msg = f"エラーが発生しました: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクトを削除
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    db.delete(project)
    db.commit()

    return {"message": "プロジェクトを削除しました"}


# === File Management Endpoints ===


class SaveFileRequest(BaseModel):
    file_path: str
    content: str
    language: str = None


@router.post("/{project_id}/files")
async def save_file(
    project_id: str,
    request: SaveFileRequest,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクトのファイルを保存（新規作成または更新）
    """
    # プロジェクトの所有権確認
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # 既存ファイルを検索
    existing_file = db.query(ProjectFile).filter(
        ProjectFile.project_id == project_id,
        ProjectFile.file_path == request.file_path
    ).first()

    if existing_file:
        # 更新
        existing_file.content = request.content
        if request.language:
            existing_file.language = request.language
        existing_file.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_file)

        return {
            "message": "ファイルを更新しました",
            "file": {
                "id": existing_file.id,
                "file_path": existing_file.file_path,
                "language": existing_file.language,
                "updated_at": existing_file.updated_at.isoformat(),
            }
        }
    else:
        # 新規作成
        new_file = ProjectFile(
            project_id=project_id,
            file_path=request.file_path,
            content=request.content,
            language=request.language,
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)

        return {
            "message": "ファイルを作成しました",
            "file": {
                "id": new_file.id,
                "file_path": new_file.file_path,
                "language": new_file.language,
                "created_at": new_file.created_at.isoformat(),
            }
        }


@router.get("/{project_id}/files")
async def get_files(
    project_id: str,
    file_path: str = None,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    プロジェクトのファイル一覧を取得、またはfile_pathが指定された場合は特定のファイルを取得
    """
    # プロジェクトの所有権確認
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # 特定のファイルを取得
    if file_path:
        file = db.query(ProjectFile).filter(
            ProjectFile.project_id == project_id,
            ProjectFile.file_path == file_path
        ).first()

        if not file:
            raise HTTPException(status_code=404, detail="ファイルが見つかりません")

        return {
            "id": file.id,
            "file_path": file.file_path,
            "content": file.content,
            "language": file.language,
            "created_at": file.created_at.isoformat(),
            "updated_at": file.updated_at.isoformat(),
        }

    # ファイル一覧を取得
    files = db.query(ProjectFile).filter(ProjectFile.project_id == project_id).all()

    return {
        "files": [
            {
                "id": f.id,
                "file_path": f.file_path,
                "language": f.language,
                "created_at": f.created_at.isoformat(),
                "updated_at": f.updated_at.isoformat(),
            }
            for f in files
        ]
    }


@router.get("/{project_id}/files/{file_path:path}")
async def get_file_by_path(
    project_id: str,
    file_path: str,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    特定のファイル内容を取得（パスパラメータ版）
    """
    # プロジェクトの所有権確認
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # ファイルを取得
    file = db.query(ProjectFile).filter(
        ProjectFile.project_id == project_id,
        ProjectFile.file_path == file_path
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

    return {
        "id": file.id,
        "file_path": file.file_path,
        "content": file.content,
        "language": file.language,
        "created_at": file.created_at.isoformat(),
        "updated_at": file.updated_at.isoformat(),
    }


@router.delete("/{project_id}/files/{file_path:path}")
async def delete_file(
    project_id: str,
    file_path: str,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    ファイルを削除
    """
    # プロジェクトの所有権確認
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

    # ファイルを取得
    file = db.query(ProjectFile).filter(
        ProjectFile.project_id == project_id,
        ProjectFile.file_path == file_path
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="ファイルが見つかりません")

    db.delete(file)
    db.commit()

    return {"message": "ファイルを削除しました", "file_path": file_path}
