from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User

router = APIRouter()


class UpdateUserRequest(BaseModel):
    name: str | None = None
    custom_claude_api_key: str | None = None


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    現在のユーザー情報を取得
    """
    return {
        "data": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role.value,
            "status": current_user.status.value,
            "avatar": None,  # TODO: アバター機能実装時に対応
            "createdAt": current_user.created_at.isoformat(),
            "updatedAt": current_user.updated_at.isoformat() if current_user.updated_at else None,
        }
    }


@router.put("/me")
async def update_me(
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ユーザー情報を更新
    """
    if request.name:
        current_user.name = request.name

    if request.custom_claude_api_key:
        # TODO: APIキーの暗号化実装（Fernet）
        current_user.custom_claude_api_key = request.custom_claude_api_key

    db.commit()
    db.refresh(current_user)

    return {
        "data": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role.value,
            "status": current_user.status.value,
            "createdAt": current_user.created_at.isoformat(),
            "updatedAt": current_user.updated_at.isoformat() if current_user.updated_at else None,
        },
        "message": "ユーザー情報を更新しました"
    }


@router.get("/me/api-usage")
async def get_api_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ユーザーのAPI使用量を取得
    """
    from app.models.models import ApiLog
    from sqlalchemy import func
    from datetime import datetime, timedelta

    # 今日のAPI使用量
    today = datetime.utcnow().date()
    today_usage = db.query(
        func.sum(ApiLog.input_tokens).label("input_tokens"),
        func.sum(ApiLog.output_tokens).label("output_tokens"),
        func.sum(ApiLog.cost).label("cost"),
        func.count(ApiLog.id).label("requests")
    ).filter(
        ApiLog.user_id == current_user.id,
        func.date(ApiLog.created_at) == today
    ).first()

    # 今月のAPI使用量
    this_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_usage = db.query(
        func.sum(ApiLog.input_tokens).label("input_tokens"),
        func.sum(ApiLog.output_tokens).label("output_tokens"),
        func.sum(ApiLog.cost).label("cost"),
        func.count(ApiLog.id).label("requests")
    ).filter(
        ApiLog.user_id == current_user.id,
        ApiLog.created_at >= this_month_start
    ).first()

    return {
        "data": {
            "today": {
                "inputTokens": today_usage.input_tokens or 0,
                "outputTokens": today_usage.output_tokens or 0,
                "cost": today_usage.cost or 0,
                "requests": today_usage.requests or 0,
            },
            "thisMonth": {
                "inputTokens": month_usage.input_tokens or 0,
                "outputTokens": month_usage.output_tokens or 0,
                "cost": month_usage.cost or 0,
                "requests": month_usage.requests or 0,
            }
        }
    }
