from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.core.deps import get_current_approved_user
from app.models.models import User, Agent
from app.agents.phase_agents import (
    Phase1RequirementsAgent,
    Phase2CodeGenerationAgent,
    Phase3DeploymentAgent,
    Phase4SelfImprovementAgent,
)

router = APIRouter()


class AgentExecuteRequest(BaseModel):
    """エージェント実行リクエスト"""
    phase: int  # 1-4
    user_message: str
    project_context: Optional[Dict[str, Any]] = {}
    conversation_history: Optional[List[Dict[str, str]]] = []


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
    request: AgentExecuteRequest,
    current_user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db)
):
    """
    エージェントを実行

    Phase 1: 要件定義エージェント
    Phase 2: コード生成エージェント
    Phase 3: デプロイエージェント
    Phase 4: 自己改善エージェント
    """
    # Phaseに応じてエージェントを選択
    agent_map = {
        1: Phase1RequirementsAgent(),
        2: Phase2CodeGenerationAgent(),
        3: Phase3DeploymentAgent(),
        4: Phase4SelfImprovementAgent(),
    }

    agent = agent_map.get(request.phase)
    if not agent:
        raise HTTPException(
            status_code=400,
            detail=f"無効なPhaseです: {request.phase}"
        )

    # タスクを構築
    task = {
        "user_message": request.user_message,
        "project_context": request.project_context,
        "conversation_history": request.conversation_history,
        "user_id": current_user.id,
    }

    # エージェントを実行
    try:
        result = await agent.execute(task)

        # TODO: 実行ログをデータベースに保存

        return {
            "status": "success",
            "phase": request.phase,
            "agent_name": agent.name,
            "result": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"エージェント実行エラー: {str(e)}"
        )
