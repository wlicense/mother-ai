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
            "appliedAt": u.created_at.isoformat(),
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
            "projectCount": len(u.projects),
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
    from datetime import datetime, timezone

    # 総統計
    total_requests = db.query(func.count(ApiLog.id)).scalar() or 0
    total_cost = db.query(func.sum(ApiLog.cost)).scalar() or 0
    total_tokens = db.query(func.sum(ApiLog.total_tokens)).scalar() or 0

    # 今日の統計（UTC基準）
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_requests = db.query(func.count(ApiLog.id)).filter(
        ApiLog.created_at >= today_start
    ).scalar() or 0
    today_cost = db.query(func.sum(ApiLog.cost)).filter(
        ApiLog.created_at >= today_start
    ).scalar() or 0

    # トップユーザー（APIコール数でトップ10）
    top_users_query = db.query(
        ApiLog.user_id,
        User.name.label('user_name'),
        func.count(ApiLog.id).label('total_requests'),
        func.sum(ApiLog.cost).label('total_cost')
    ).join(User, ApiLog.user_id == User.id)\
     .group_by(ApiLog.user_id, User.name)\
     .order_by(func.count(ApiLog.id).desc())\
     .limit(10)\
     .all()

    top_users = [
        {
            "user_id": row.user_id,
            "user_name": row.user_name,
            "total_requests": row.total_requests,
            "total_cost": float(row.total_cost) if row.total_cost else 0.0,
        }
        for row in top_users_query
    ]

    # Phase別統計（Phase 1-14）
    phase_stats_query = db.query(
        ApiLog.phase,
        func.count(ApiLog.id).label('total_requests'),
        func.sum(ApiLog.cost).label('total_cost'),
        func.sum(ApiLog.total_tokens).label('total_tokens')
    ).filter(ApiLog.phase.isnot(None))\
     .group_by(ApiLog.phase)\
     .order_by(ApiLog.phase)\
     .all()

    phase_stats = [
        {
            "phase": row.phase,
            "total_requests": row.total_requests,
            "total_cost": float(row.total_cost) if row.total_cost else 0.0,
            "total_tokens": int(row.total_tokens) if row.total_tokens else 0,
        }
        for row in phase_stats_query
    ]

    # Phase別の詳細統計（今日のデータ）
    today_phase_stats_query = db.query(
        ApiLog.phase,
        func.count(ApiLog.id).label('requests'),
        func.sum(ApiLog.cost).label('cost')
    ).filter(
        ApiLog.phase.isnot(None),
        ApiLog.created_at >= today_start
    ).group_by(ApiLog.phase)\
     .order_by(ApiLog.phase)\
     .all()

    today_phase_stats = [
        {
            "phase": row.phase,
            "requests": row.requests,
            "cost": float(row.cost) if row.cost else 0.0,
        }
        for row in today_phase_stats_query
    ]

    return {
        "total_requests": total_requests,
        "total_cost": float(total_cost) if total_cost else 0.0,
        "total_tokens": int(total_tokens) if total_tokens else 0,
        "today_requests": today_requests,
        "today_cost": float(today_cost) if today_cost else 0.0,
        "top_users": top_users,
        "phase_stats": phase_stats,
        "today_phase_stats": today_phase_stats,
    }
