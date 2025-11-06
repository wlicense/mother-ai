# バックエンド実装ガイド

## 概要

このドキュメントは、バックエンド実装エージェントが効率的にバックエンドAPIを実装するための詳細ガイドです。

**作成日**: 2025年11月6日
**対象**: バックエンド実装エージェント
**前提**: バックエンド実装計画（SCOPE_PROGRESS.md セクション2）策定済み

---

## 実装順序の厳守

### 必須ルール

1. **スライス1（認証基盤）を最初に完成させる**
   - 理由: 全エンドポイントがJWT認証に依存
   - 完了条件: ログイン、登録、ユーザー情報取得が動作

2. **番号-アルファベット表記（2-A, 2-B等）は並列実装可能**
   - 例: スライス2-Aとスライス2-Bは同時に実装できる
   - 理由: テーブルが独立しており、マイグレーション競合なし

3. **依存関係を確認してから次のスライスへ進む**
   - スライス3-Aはスライス2-B完了後
   - スライス5はスライス3-A完了後

---

## 技術スタック

### バックエンド構成
```yaml
言語: Python 3.11+
フレームワーク: FastAPI
ORM: SQLAlchemy 2.0
データベース: PostgreSQL（Neon）
認証: JWT（python-jose）
パスワードハッシュ化: bcrypt
暗号化: cryptography（Fernet）
AI API: Anthropic Claude API
```

### ディレクトリ構造
```
backend/
├── src/
│   ├── main.py                 # FastAPIアプリケーション
│   ├── config.py               # 設定管理
│   ├── database.py             # データベース接続
│   ├── models/                 # SQLAlchemyモデル
│   │   ├── user.py
│   │   ├── application.py
│   │   ├── project.py
│   │   ├── message.py
│   │   └── api_usage.py
│   ├── schemas/                # Pydanticスキーマ
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── message.py
│   ├── routers/                # APIエンドポイント
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── projects.py
│   │   ├── messages.py
│   │   └── admin.py
│   ├── services/               # ビジネスロジック
│   │   ├── auth_service.py
│   │   ├── claude_service.py
│   │   └── email_service.py
│   ├── middleware/             # ミドルウェア
│   │   └── auth.py
│   └── utils/                  # ユーティリティ
│       ├── security.py
│       ├── jwt.py
│       └── encryption.py
├── alembic/                    # マイグレーション
│   └── versions/
├── tests/                      # テスト
│   ├── test_auth.py
│   ├── test_projects.py
│   └── test_messages.py
├── requirements.txt
└── .env
```

---

## スライス別実装ガイド

### スライス1: 認証基盤

#### データベースモデル

**Users テーブル**
```python
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum('user', 'admin', name='user_role'), default='user')
    status = Column(Enum('pending', 'approved', 'rejected', 'suspended', name='user_status'), default='pending')
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

**Applications テーブル**
```python
class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    name = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    experience_level = Column(Enum('beginner', 'html_css', 'other', name='experience_level'))
    referral_source = Column(Enum('sns', 'search', 'referral', 'other', name='referral_source'))
    oauth_provider = Column(Enum('google', 'github', name='oauth_provider'), nullable=True)
    status = Column(Enum('pending', 'approved', 'rejected', name='application_status'), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)
```

#### エンドポイント実装

**POST /api/v1/auth/register**
```python
@router.post("/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # 1. メールアドレス重複チェック
    # 2. パスワードハッシュ化（bcrypt）
    # 3. Applicationレコード作成
    # 4. 成功レスポンス返却
```

**POST /api/v1/auth/login**
```python
@router.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # 1. ユーザー検索
    # 2. パスワード検証
    # 3. ステータスチェック（pending → /pending, suspended → エラー）
    # 4. JWTトークン生成
    # 5. AuthResponse返却
```

**GET /api/v1/users/me**
```python
@router.get("/me")
async def get_current_user(current_user: User = Depends(get_current_user_dependency)):
    # JWT認証ミドルウェアでユーザー取得済み
    # ユーザー情報を返却
```

#### セキュリティ実装

**パスワードハッシュ化**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**JWT認証**
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

### スライス2-B: プロジェクト管理

#### データベースモデル

**Projects テーブル**
```python
class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    current_phase = Column(Integer, default=1)
    progress_percentage = Column(Integer, default=0)
    deployed_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    # リレーション
    owner = relationship("User", back_populates="projects")
    phases = relationship("PhaseProgress", back_populates="project")
```

**PhaseProgress テーブル**
```python
class PhaseProgress(Base):
    __tablename__ = "phase_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=False)
    phase_number = Column(Integer, nullable=False)
    phase_name = Column(String, nullable=False)
    status = Column(Enum('locked', 'available', 'in_progress', 'completed', name='phase_status'), default='locked')
    progress = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # リレーション
    project = relationship("Project", back_populates="phases")
```

---

### スライス3-A: AI対話機能

#### Claude API統合

**Claude Service**
```python
from anthropic import Anthropic

class ClaudeService:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

    async def send_message_stream(
        self,
        messages: list[dict],
        system_prompt: str,
        model: str = "claude-sonnet-4-5-20250929"
    ):
        """SSEストリーミングでメッセージ送信"""
        with self.client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text
```

#### SSEストリーミング実装

```python
from fastapi.responses import StreamingResponse

@router.post("/projects/{project_id}/messages")
async def send_message(
    project_id: str,
    message_data: MessageRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    async def event_stream():
        # 1. ユーザーメッセージをDBに保存
        # 2. Claude APIにストリーミングリクエスト
        claude_service = ClaudeService()
        async for chunk in claude_service.send_message_stream(messages, system_prompt):
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

        # 3. 完了メッセージ送信
        yield f"data: {json.dumps({'type': 'end'})}\n\n"

        # 4. AIメッセージをDBに保存
        # 5. API使用量をログに記録

    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## テスト戦略

### 統合テスト

各スライス完了時に統合テストを実行:

```python
# tests/test_auth.py
def test_register_success():
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123",
        "purpose": "テスト目的"
    })
    assert response.status_code == 200

def test_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "token" in response.json()["data"]
```

### E2Eテスト

E2Eテスト仕様書（docs/e2e-specs/README.md）に従ってテスト実行。

---

## チェックリスト

### スライス1完了条件
- [ ] Usersテーブル作成完了
- [ ] Applicationsテーブル作成完了
- [ ] POST /auth/register実装完了
- [ ] POST /auth/login実装完了
- [ ] GET /users/me実装完了
- [ ] JWT認証ミドルウェア実装完了
- [ ] 統合テスト成功

### スライス2-B完了条件
- [ ] Projectsテーブル作成完了
- [ ] PhaseProgressテーブル作成完了
- [ ] POST /projects実装完了
- [ ] GET /projects実装完了
- [ ] GET /projects/{id}実装完了
- [ ] DELETE /projects/{id}実装完了
- [ ] 統合テスト成功

### スライス3-A完了条件
- [ ] ChatMessagesテーブル作成完了
- [ ] APIUsageLogsテーブル作成完了
- [ ] Claude API統合完了
- [ ] SSEストリーミング実装完了
- [ ] プロンプトキャッシング実装完了
- [ ] POST /projects/{id}/messages実装完了
- [ ] GET /projects/{id}/messages実装完了
- [ ] 統合テスト成功

---

## 引き継ぎ情報

### 利用可能なリソース

- **API仕様書**: `docs/api-specs/README.md`
- **型定義**: `frontend/src/types/index.ts`（バックエンドと同期）
- **E2Eテスト仕様書**: `docs/e2e-specs/README.md`
- **実装計画**: `docs/SCOPE_PROGRESS.md` セクション2

### 環境変数設定

`.env`ファイルに以下を設定:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
CLAUDE_API_KEY=sk-ant-xxx
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### 次のステップ

1. バックエンドディレクトリ構造を作成
2. 依存関係インストール（`requirements.txt`）
3. データベースマイグレーション初期化（Alembic）
4. スライス1実装開始

---

**作成日**: 2025年11月6日
**バージョン**: 1.0
**次回更新**: 実装開始後
