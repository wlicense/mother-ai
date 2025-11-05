from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_approved_user
from app.models.models import User, Agent

router = APIRouter()


@router.get("/")
async def get_agents(
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    登録されているエージェント一覧を取得
    """
    agents = db.query(Agent).filter(Agent.is_active == True).all()

    return [
        {
            "id": a.id,
            "name": a.name,
            "agent_type": a.agent_type,
            "level": a.level,
            "created_by": a.created_by,
            "version": a.version,
            "created_at": a.created_at.isoformat(),
        }
        for a in agents
    ]


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    エージェント詳細を取得
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()

    if not agent:
        raise HTTPException(status_code=404, detail="エージェントが見つかりません")

    return {
        "id": agent.id,
        "name": agent.name,
        "agent_type": agent.agent_type,
        "level": agent.level,
        "parent_agent_id": agent.parent_agent_id,
        "is_active": agent.is_active,
        "config": agent.config,
        "created_by": agent.created_by,
        "version": agent.version,
        "created_at": agent.created_at.isoformat(),
        "updated_at": agent.updated_at.isoformat() if agent.updated_at else None,
    }


@router.post("/execute")
async def execute_agent(
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    エージェントを実行（実装予定）
    """
    # TODO: Implement agent execution with CrewAI
    raise HTTPException(
        status_code=501,
        detail="エージェント実行機能は実装中です"
    )
