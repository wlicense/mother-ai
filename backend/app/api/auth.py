from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, UserStatus, UserRole
from app.services.oauth_service import get_oauth_client
from app.services.email_service import send_admin_notification
from datetime import datetime
import httpx

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


@router.post("/register")
async def register(request: ApplyRequest, db: Session = Depends(get_db)):
    """
    新規ユーザー申請
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

    # 管理者にメール通知を送る
    await send_admin_notification(new_user.name, new_user.email, request.purpose)

    return {
        "message": "申請を受け付けました。審査完了までお待ちください。",
        "user_id": new_user.id,
    }


@router.get("/oauth/google")
async def google_oauth_login(request: Request):
    """
    Google OAuth認証開始
    """
    oauth = get_oauth_client()
    redirect_uri = request.url_for('google_oauth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/oauth/google/callback")
async def google_oauth_callback(request: Request, db: Session = Depends(get_db)):
    """
    Google OAuth認証コールバック
    """
    try:
        oauth = get_oauth_client()
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ユーザー情報を取得できませんでした",
            )

        email = user_info.get('email')
        name = user_info.get('name', email)
        google_id = user_info.get('sub')

        # ユーザーを検索または作成
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # 新規ユーザーとして作成（OAuth経由は自動承認）
            user = User(
                email=email,
                name=name,
                google_id=google_id,
                status=UserStatus.approved,  # OAuth経由は自動承認
                role=UserRole.user,
                hashed_password="",  # OAuthユーザーはパスワード不要
                application_purpose="Google OAuth経由で登録",
            )
            db.add(user)
        else:
            # 既存ユーザーの場合、Google IDを更新
            if not user.google_id:
                user.google_id = google_id

        # 最終ログイン日時を更新
        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)

        # トークンを生成
        access_token = create_access_token(data={"sub": user.id})

        # フロントエンドにリダイレクト（トークンをクエリパラメータで渡す）
        frontend_url = f"http://localhost:3347/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        print(f"Google OAuth エラー: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"認証に失敗しました: {str(e)}",
        )


@router.get("/oauth/github")
async def github_oauth_login(request: Request):
    """
    GitHub OAuth認証開始
    """
    oauth = get_oauth_client()
    redirect_uri = request.url_for('github_oauth_callback')
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/oauth/github/callback")
async def github_oauth_callback(request: Request, db: Session = Depends(get_db)):
    """
    GitHub OAuth認証コールバック
    """
    try:
        oauth = get_oauth_client()
        token = await oauth.github.authorize_access_token(request)

        # GitHub APIからユーザー情報を取得
        async with httpx.AsyncClient() as client:
            headers = {
                'Authorization': f"token {token['access_token']}",
                'Accept': 'application/json',
            }

            # ユーザー基本情報
            user_response = await client.get('https://api.github.com/user', headers=headers)
            user_info = user_response.json()

            # メールアドレス取得（プライベートの場合もあるので別途取得）
            email_response = await client.get('https://api.github.com/user/emails', headers=headers)
            emails = email_response.json()
            primary_email = next((e['email'] for e in emails if e['primary']), emails[0]['email'] if emails else None)

        if not primary_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="メールアドレスを取得できませんでした",
            )

        email = primary_email
        name = user_info.get('name', user_info.get('login', email))
        github_id = str(user_info.get('id'))

        # ユーザーを検索または作成
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # 新規ユーザーとして作成（OAuth経由は自動承認）
            user = User(
                email=email,
                name=name,
                github_id=github_id,
                status=UserStatus.approved,  # OAuth経由は自動承認
                role=UserRole.user,
                hashed_password="",  # OAuthユーザーはパスワード不要
                application_purpose="GitHub OAuth経由で登録",
            )
            db.add(user)
        else:
            # 既存ユーザーの場合、GitHub IDを更新
            if not user.github_id:
                user.github_id = github_id

        # 最終ログイン日時を更新
        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)

        # トークンを生成
        access_token = create_access_token(data={"sub": user.id})

        # フロントエンドにリダイレクト（トークンをクエリパラメータで渡す）
        frontend_url = f"http://localhost:3347/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        print(f"GitHub OAuth エラー: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"認証に失敗しました: {str(e)}",
        )
