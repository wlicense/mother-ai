from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(enum.Enum):
    user = "user"
    admin = "admin"


class UserStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"


class SelfExpansionMode(enum.Enum):
    manual = "manual"          # 手動モード（最も安全）
    semi_auto = "semi_auto"    # 半自動モード（推奨）
    auto = "auto"              # 自動モード（上級者向け）


class ProjectStatus(enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.pending, nullable=False)

    # OAuth fields
    google_id = Column(String, unique=True, nullable=True)
    github_id = Column(String, unique=True, nullable=True)

    # Application info
    application_purpose = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # API settings
    custom_claude_api_key = Column(String, nullable=True)

    # Self-expansion settings
    self_expansion_mode = Column(
        Enum(SelfExpansionMode),
        default=SelfExpansionMode.manual,  # 新規ユーザーは手動モード
        nullable=False
    )

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    api_logs = relationship("ApiLog", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.active, nullable=False)
    current_phase = Column(Integer, default=1, nullable=False)

    # Owner
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Generated code and settings
    requirements = Column(JSON, nullable=True)  # Phase 1の要件定義結果
    generated_code = Column(JSON, nullable=True)  # Phase 2のコード生成結果
    deployment_info = Column(JSON, nullable=True)  # Phase 3のデプロイ情報

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="projects")
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    phase_executions = relationship("PhaseExecution", back_populates="project", cascade="all, delete-orphan")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    phase = Column(Integer, nullable=False)
    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="messages")


class PhaseExecution(Base):
    __tablename__ = "phase_executions"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    phase = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # "pending", "in_progress", "completed", "failed"
    result = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)

    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="phase_executions")


class Agent(Base):
    """
    将来の階層型マルチエージェント用のテーブル
    MVP: 基本的なエージェント情報のみ
    将来: parent_agent_id, level, configなどで階層管理
    """
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    agent_type = Column(String, nullable=False)  # "orchestrator", "phase1", "phase2", etc.
    level = Column(String, nullable=False, default="worker")  # "ceo", "director", "manager", "worker"
    parent_agent_id = Column(String, ForeignKey("agents.id"), nullable=True)  # 将来の階層用
    is_active = Column(Boolean, default=True, nullable=False)
    config = Column(JSON, nullable=True)

    # 自己改善用
    created_by = Column(String, default="system", nullable=False)  # "system" or "phase4"
    version = Column(Integer, default=1, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ApiLog(Base):
    __tablename__ = "api_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, nullable=True)
    model = Column(String, nullable=False)
    input_tokens = Column(Integer, nullable=False)
    output_tokens = Column(Integer, nullable=False)
    total_tokens = Column(Integer, nullable=False)
    cost = Column(Integer, nullable=False)  # Cost in yen (円)
    cached = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="api_logs")


class ProjectFile(Base):
    """
    プロジェクトのコードファイル
    Phase 2で生成されたコードやユーザーが編集したコードを保存
    """
    __tablename__ = "project_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    file_path = Column(String, nullable=False)  # e.g., "src/App.tsx"
    content = Column(Text, nullable=False)
    language = Column(String, nullable=True)  # e.g., "typescript", "python"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="files")


class SystemExpansion(Base):
    """
    Phase 4自己改善エージェントによるシステム拡張履歴
    セキュリティとロールバック用
    """
    __tablename__ = "system_expansions"

    id = Column(String, primary_key=True, default=generate_uuid)
    expansion_type = Column(String, nullable=False)  # "new_agent", "code_update", "schema_change"
    change_level = Column(String, nullable=False, default="medium")  # "critical", "medium", "low"
    description = Column(Text, nullable=False)
    change_details = Column(JSON, nullable=False)
    status = Column(String, nullable=False)  # "pending_approval", "approved", "rejected", "rolled_back"

    # Security scan results
    security_scan_passed = Column(Boolean, default=False, nullable=False)
    security_issues = Column(JSON, nullable=True)

    # Approval workflow
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
