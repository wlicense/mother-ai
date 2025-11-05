from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, UserStatus
from datetime import datetime

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ApplyRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    purpose: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    ログイン
    """
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが間違っています",
        )

    # 最終ログイン日時を更新
    user.last_login_at = datetime.utcnow()
    db.commit()

    # トークンを生成
    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "status": user.status.value,
            "createdAt": user.created_at.isoformat(),
        },
    }


@router.post("/apply")
async def apply(request: ApplyRequest, db: Session = Depends(get_db)):
    """
    利用申請
    """
    # メールアドレスの重複チェック
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています",
        )

    # パスワードの長さチェック
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="パスワードは8文字以上である必要があります",
        )

    # 利用目的の長さチェック
    if len(request.purpose) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="利用目的は20文字以上で記入してください",
        )

    # ユーザーを作成（ステータスはpending）
    hashed_password = get_password_hash(request.password)
    new_user = User(
        email=request.email,
        name=request.name,
        hashed_password=hashed_password,
        status=UserStatus.pending,
        application_purpose=request.purpose,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # TODO: 管理者にメール通知を送る

    return {
        "message": "申請を受け付けました。審査完了までお待ちください。",
        "user_id": new_user.id,
    }


@router.post("/oauth/google")
async def google_oauth(db: Session = Depends(get_db)):
    """
    Google OAuth認証（実装予定）
    """
    # TODO: Implement Google OAuth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth認証は実装中です",
    )


@router.post("/oauth/github")
async def github_oauth(db: Session = Depends(get_db)):
    """
    GitHub OAuth認証（実装予定）
    """
    # TODO: Implement GitHub OAuth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth認証は実装中です",
    )
