from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from enum import Enum


class AgentLevel(str, Enum):
    """
    エージェントの階層レベル
    MVP: すべて"worker"レベル
    将来: CEO → Director → Manager → Worker の階層構造
    """
    CEO = "ceo"
    DIRECTOR = "director"
    MANAGER = "manager"
    WORKER = "worker"


class AgentMessage(BaseModel):
    """
    エージェント間の統一メッセージプロトコル
    """
    from_agent: str
    to_agent: str
    message_type: str  # "request", "response", "delegation", "report"
    content: str
    task_id: str
    parent_task_id: Optional[str] = None  # 将来の階層追跡用
    metadata: Dict[str, Any] = {}


class BaseAgent(ABC):
    """
    全エージェントの基底クラス
    MVP: 単純な実行
    将来: 階層型の委譲機能
    """

    def __init__(
        self,
        name: str,
        agent_type: str,
        level: AgentLevel = AgentLevel.WORKER,
        config: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.agent_type = agent_type
        self.level = level
        self.config = config or {}
        self.subordinates: List['BaseAgent'] = []  # 将来の部下リスト（MVP: 空）
        self.can_delegate = level != AgentLevel.WORKER

    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        タスクを実行
        各エージェントで実装が必要
        """
        pass

    async def delegate(self, task: Dict[str, Any], to_agent: 'BaseAgent') -> Dict[str, Any]:
        """
        タスクを部下エージェントに委譲
        MVP: 未使用だがインターフェース定義
        将来: 階層型マルチエージェントで使用
        """
        if self.can_delegate and to_agent in self.subordinates:
            return await to_agent.execute(task)
        else:
            # 委譲できない場合は自分で実行
            return await self.execute(task)

    def add_subordinate(self, agent: 'BaseAgent'):
        """
        部下エージェントを追加
        MVP: 未使用
        将来: 階層構造構築時に使用
        """
        if self.can_delegate:
            self.subordinates.append(agent)

    def get_info(self) -> Dict[str, Any]:
        """
        エージェント情報を取得
        """
        return {
            "name": self.name,
            "agent_type": self.agent_type,
            "level": self.level.value,
            "can_delegate": self.can_delegate,
            "subordinate_count": len(self.subordinates),
        }


class AgentRegistry:
    """
    エージェント登録・管理クラス
    Phase 4で新しいエージェントを動的に追加可能
    """
    _agents: Dict[str, BaseAgent] = {}

    @classmethod
    def register(cls, name: str, agent: BaseAgent):
        """
        エージェントを登録
        """
        cls._agents[name] = agent

    @classmethod
    def get_agent(cls, name: str) -> Optional[BaseAgent]:
        """
        エージェントを取得
        """
        return cls._agents.get(name)

    @classmethod
    def get_all_agents(cls) -> Dict[str, BaseAgent]:
        """
        全エージェントを取得
        """
        return cls._agents.copy()

    @classmethod
    def add_new_agent(cls, agent_code: str, name: str):
        """
        Phase 4用: 新しいエージェントを動的に追加
        MVP: 基本実装のみ
        将来: セキュリティチェック + サンドボックス実行
        """
        # TODO: Phase 4で実装
        # 1. セキュリティスキャン
        # 2. サンドボックスでテスト
        # 3. 承認プロセス
        # 4. 本番環境に追加
        pass


class AgentLogger:
    """
    エージェントのログ記録
    将来の委譲ログ、階層追跡に使用
    """

    @staticmethod
    def log_execution(agent_name: str, task_id: str, status: str, result: Optional[Dict] = None):
        """
        実行ログを記録
        """
        # TODO: データベースまたはファイルにログ保存
        print(f"[{agent_name}] Task {task_id}: {status}")

    @staticmethod
    def log_delegation(from_agent: str, to_agent: str, task_id: str):
        """
        委譲ログを記録
        MVP: 未使用だが定義
        将来: 階層型エージェントで使用
        """
        print(f"[DELEGATION] {from_agent} → {to_agent}: Task {task_id}")
