from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.models.models import User, UserStatus, Project, ApiLog
from app.services.email_service import send_approval_email, send_rejection_email

router = APIRouter()


class ApproveUserRequest(BaseModel):
    user_id: str


class RejectUserRequest(BaseModel):
    user_id: str
    reason: str


@router.get("/applications")
async def get_pending_applications(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    審査待ちの申請一覧を取得
    """
    pending_users = db.query(User).filter(User.status == UserStatus.pending).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "purpose": u.application_purpose,
            "status": u.status.value,
            "applied_at": u.created_at.isoformat(),
        }
        for u in pending_users
    ]


@router.put("/applications/{id}/approve")
async def approve_application(
    id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    申請を承認
    """
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if user.status != UserStatus.pending:
        raise HTTPException(status_code=400, detail="このユーザーは既に処理されています")

    user.status = UserStatus.approved
    db.commit()

    # ユーザーにメール通知を送る
    await send_approval_email(user.email, user.name)

    return {"data": {"message": "ユーザーを承認しました", "userId": user.id}}


class RejectApplicationRequest(BaseModel):
    reason: str


@router.put("/applications/{id}/reject")
async def reject_application(
    id: str,
    request: RejectApplicationRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    申請を却下
    """
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if user.status != UserStatus.pending:
        raise HTTPException(status_code=400, detail="このユーザーは既に処理されています")

    user.status = UserStatus.rejected
    user.rejection_reason = request.reason
    db.commit()

    # ユーザーにメール通知を送る
    await send_rejection_email(user.email, user.name, user.rejection_reason)

    return {"data": {"message": "ユーザーを却下しました", "userId": user.id}}


@router.get("/users")
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    全ユーザー一覧を取得
    """
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "status": u.status.value,
            "project_count": len(u.projects),
            "last_login": u.last_login_at.isoformat() if u.last_login_at else None,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    ユーザーを停止
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    user.status = UserStatus.suspended
    db.commit()

    return {"message": "ユーザーを停止しました"}


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    ユーザーを有効化
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    user.status = UserStatus.approved
    db.commit()

    return {"message": "ユーザーを有効化しました"}


@router.get("/api-stats")
async def get_api_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    API使用統計を取得
    """
    # 総統計
    total_calls = db.query(func.count(ApiLog.id)).scalar() or 0
    total_cost = db.query(func.sum(ApiLog.cost)).scalar() or 0
    total_tokens = db.query(func.sum(ApiLog.total_tokens)).scalar() or 0

    # 今日の統計（簡易版 - 実際はdateフィルタが必要）
    today_calls = total_calls  # Placeholder
    today_cost = total_cost  # Placeholder

    # 最近のAPI呼び出し
    recent_logs = db.query(ApiLog).order_by(ApiLog.created_at.desc()).limit(10).all()

    return {
        "total_calls": total_calls,
        "total_cost": total_cost,
        "total_tokens": total_tokens,
        "today_calls": today_calls,
        "today_cost": today_cost,
        "recent_calls": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "project_id": log.project_id,
                "model": log.model,
                "tokens": log.total_tokens,
                "cost": log.cost,
                "created_at": log.created_at.isoformat(),
            }
            for log in recent_logs
        ],
    }
