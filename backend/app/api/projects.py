from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_approved_user
from app.models.models import User, Project, ProjectStatus, Message

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


@router.get("/", response_model=List[ProjectResponse])
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


@router.post("/", response_model=ProjectResponse)
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
    プロジェクトにメッセージを送信し、AIからの応答を取得
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

    # TODO: AIエージェントに処理を依頼して応答を取得
    # 現在はプレースホルダーの応答
    ai_response = "メッセージを受け取りました。処理中です..."

    # AIの応答を保存
    assistant_message = Message(
        project_id=project_id,
        phase=request.phase,
        role="assistant",
        content=ai_response,
    )
    db.add(assistant_message)
    db.commit()

    return {
        "user_message": {
            "id": user_message.id,
            "role": "user",
            "content": user_message.content,
            "created_at": user_message.created_at.isoformat(),
        },
        "assistant_message": {
            "id": assistant_message.id,
            "role": "assistant",
            "content": assistant_message.content,
            "created_at": assistant_message.created_at.isoformat(),
        },
    }


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
