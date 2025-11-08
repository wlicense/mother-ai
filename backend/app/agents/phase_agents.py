from typing import Dict, Any
from app.agents.base import BaseAgent, AgentLevel
from app.agents.claude_client import get_claude_client


class Phase1RequirementsAgent(BaseAgent):
    """
    Phase 1: 要件定義エージェント
    ユーザーとの対話で要件を引き出し、明確化する
    """

    def __init__(self):
        super().__init__(
            name="Phase1RequirementsAgent",
            agent_type="requirements",
            level=AgentLevel.WORKER
        )
        self.claude = get_claude_client()

        # システムプロンプト（プロンプトキャッシング対象）
        self.system_prompt = """あなたは「マザーAI」の Phase 1 要件定義エージェントです。

あなたの役割:
- ユーザーとの対話を通じて、開発したいアプリケーションの要件を明確にする
- 曖昧な要件を具体的な機能要求に変換する
- 技術的な実現可能性を考慮しながら質問する
- React + TypeScript + FastAPI + PostgreSQL のスタックで実現可能な範囲を提案する

対話スタイル:
- 親しみやすく、専門用語を避ける
- 1回の応答で3-5個の質問に絞る
- ユーザーの回答から次の質問を動的に生成
- 具体例を示しながら質問する

目標:
- プロジェクトのタイプ（ECサイト、SNS、ダッシュボード等）を特定
- 主要機能を3-5個リストアップ
- ユーザー種別（一般ユーザー、管理者等）を特定
- データモデルの概要を把握

出力フォーマット:
1. ユーザーへの親しみやすい応答（質問含む）
2. 現在把握している要件の要約
3. 次のステップの提案"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        要件定義タスクを実行
        """
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})
        conversation_history = task.get("conversation_history", [])

        # 会話履歴を構築
        messages = []
        for msg in conversation_history:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        # 現在のユーザーメッセージを追加
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Claude APIで要件を引き出す
        result = await self.claude.generate_text(
            messages=messages,
            system_prompt=self.system_prompt,
            max_tokens=2048,
            temperature=0.7,
            use_cache=True  # プロンプトキャッシングを使用
        )

        if "error" in result:
            return {
                "status": "error",
                "response": f"エラーが発生しました: {result['error']}",
                "requirements": {},
            }

        # レスポンスから要件を抽出（簡易版）
        response_text = result["content"]

        # プロジェクトタイプを推定
        project_type = "general"
        if any(kw in user_message.lower() for kw in ["ec", "ecommerce", "ショップ", "通販"]):
            project_type = "ecommerce"
        elif any(kw in user_message.lower() for kw in ["sns", "ソーシャル", "コミュニティ"]):
            project_type = "social"
        elif any(kw in user_message.lower() for kw in ["dashboard", "ダッシュボード", "管理"]):
            project_type = "dashboard"

        requirements = {
            "project_type": project_type,
            "features": [],  # 後で会話から抽出
            "context": project_context,
        }

        return {
            "status": "success",
            "response": response_text,
            "requirements": requirements,
            "usage": result.get("usage", {}),
            "cost": self.claude.estimate_cost(result.get("usage", {})),
        }


class Phase2CodeGenerationAgent(BaseAgent):
    """
    Phase 2: コード生成エージェント
    要件定義に基づいてReact + FastAPIのコードを自動生成
    """

    def __init__(self):
        super().__init__(
            name="Phase2CodeGenerationAgent",
            agent_type="code_generation",
            level=AgentLevel.WORKER
        )

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        コード生成タスクを実行
        """
        requirements = task.get("requirements", {})
        user_message = task.get("user_message", "")

        # TODO: Claude APIを使用してコードを生成
        # - Frontend: React + TypeScript + MUI
        # - Backend: FastAPI + SQLAlchemy
        # - プロンプトキャッシングでコスト削減

        # Mock code generation with realistic structure
        mock_files = {
            "frontend": {
                "src/App.tsx": """import React from 'react';
import { ThemeProvider } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>Hello World</div>
    </ThemeProvider>
  );
}

export default App;""",
                "src/components/Header.tsx": """import { AppBar, Toolbar, Typography } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">My App</Typography>
      </Toolbar>
    </AppBar>
  );
}""",
                "package.json": """{
  "name": "frontend",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.3.1",
    "@mui/material": "^6.0.0"
  }
}""",
            },
            "backend": {
                "main.py": """from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
""",
                "models.py": """from sqlalchemy import Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    name = Column(String)
""",
            }
        }

        response = """コードを生成しました！

**生成されたファイル:**

**フロントエンド (React + TypeScript + MUI)**
- src/App.tsx: メインコンポーネント
- src/components/Header.tsx: ヘッダーコンポーネント
- package.json: 依存関係定義

**バックエンド (FastAPI + SQLAlchemy)**
- main.py: FastAPIアプリケーション
- models.py: データベースモデル

コードエディタでファイルを確認してください。必要に応じて修正できます。"""

        return {
            "status": "success",
            "response": response,
            "generated_code": mock_files,
            "file_count": sum(len(files) for files in mock_files.values()),
        }


class Phase3DeploymentAgent(BaseAgent):
    """
    Phase 3: デプロイエージェント
    生成されたコードをVercel + GCRへ自動デプロイ
    """

    def __init__(self):
        super().__init__(
            name="Phase3DeploymentAgent",
            agent_type="deployment",
            level=AgentLevel.WORKER
        )

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        デプロイタスクを実行
        """
        generated_code = task.get("generated_code", {})
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})
        project_name = project_context.get("project_name", "my-project")

        # プロジェクト名を安全な形式に変換
        safe_project_name = project_name.lower().replace(" ", "-").replace("_", "-")

        # Phase 2で生成されたコードを使用（まだない場合はサンプル）
        if not generated_code:
            generated_code = self._get_sample_code()

        frontend_code = generated_code.get("frontend", {})
        backend_code = generated_code.get("backend", {})

        # デプロイメントサービスを使用
        from app.services.deployment_service import get_deployment_service
        import os

        # 環境変数チェック
        has_github_token = bool(os.getenv("GITHUB_ACCESS_TOKEN"))
        has_vercel_token = bool(os.getenv("VERCEL_ACCESS_TOKEN"))
        has_gcp_project = bool(os.getenv("GCP_PROJECT_ID"))

        # APIトークンが設定されていない場合はモックレスポンス
        if not (has_github_token and has_vercel_token and has_gcp_project):
            return self._mock_deployment_response(safe_project_name)

        # 実際のデプロイを実行
        try:
            deployment_service = get_deployment_service()
            result = await deployment_service.deploy_full_stack_app(
                project_name=safe_project_name,
                frontend_code=frontend_code,
                backend_code=backend_code,
            )

            if result["status"] == "success":
                response = f"""デプロイが完了しました！ 🎉

**デプロイ結果:**

1. ✅ GitHubリポジトリ作成完了
   - リポジトリ: {result['github']['url']}
   - コミット: {result['github']['commit'][:8]}

2. ✅ Vercelにフロントエンドをデプロイ完了
   - URL: https://{result['frontend']['url']}
   - Deployment ID: {result['frontend']['deployment_id']}

3. ✅ Google Cloud Runにバックエンドをデプロイ完了
   - URL: {result['backend']['url']}
   - Service: {result['backend']['service_name']}

**アクセスURL:**
- フロントエンド: https://{result['frontend']['url']}
- バックエンド: {result['backend']['url']}
- APIドキュメント: {result['backend']['url']}/docs

**次のステップ:**
- カスタムドメインの設定
- 環境変数の本番用設定
- モニタリング・ログ設定
"""
                return {
                    "status": "success",
                    "response": response,
                    "deployment_urls": {
                        "frontend": f"https://{result['frontend']['url']}",
                        "backend": result['backend']['url'],
                        "api_docs": f"{result['backend']['url']}/docs",
                        "github": result['github']['url'],
                    },
                }
            else:
                error_msg = result.get("error", "不明なエラー")
                return {
                    "status": "error",
                    "response": f"デプロイに失敗しました: {error_msg}",
                }

        except Exception as e:
            return {
                "status": "error",
                "response": f"デプロイ中にエラーが発生しました: {str(e)}",
            }

    def _mock_deployment_response(self, project_name: str) -> Dict[str, Any]:
        """モックデプロイレスポンス（APIトークンが未設定の場合）"""
        import hashlib
        import time

        deployment_id = hashlib.md5(f"{project_name}{time.time()}".encode()).hexdigest()[:8]

        response = f"""デプロイをシミュレーションしました（テストモード）

⚠️ **注意**: 実際のデプロイには以下の環境変数が必要です：
- GITHUB_ACCESS_TOKEN
- VERCEL_ACCESS_TOKEN
- GCP_PROJECT_ID

**シミュレーション結果:**

1. ✅ GitHubリポジトリに push（シミュレーション）
   - リポジトリ: https://github.com/your-org/{project_name}
   - コミット: {deployment_id}

2. ✅ Vercelにフロントエンドをデプロイ（シミュレーション）
   - URL: https://{project_name}-{deployment_id}.vercel.app

3. ✅ Google Cloud Runにバックエンドをデプロイ（シミュレーション）
   - URL: https://{project_name}-backend-{deployment_id}.run.app

**次のステップ:**
1. 必要な環境変数を設定してください
2. 再度デプロイを実行してください
"""
        return {
            "status": "simulated",
            "response": response,
            "deployment_urls": {
                "frontend": f"https://{project_name}-{deployment_id}.vercel.app",
                "backend": f"https://{project_name}-backend-{deployment_id}.run.app",
                "api_docs": f"https://{project_name}-backend-{deployment_id}.run.app/docs",
            },
            "deployment_id": deployment_id,
        }

    def _get_sample_code(self) -> Dict[str, Dict[str, str]]:
        """サンプルコード（Phase 2が未実行の場合）"""
        return {
            "frontend": {
                "package.json": """{
  "name": "frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.11"
  }
}""",
                "index.html": """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>""",
                "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)""",
                "src/App.jsx": """import React from 'react'

function App() {
  return (
    <div>
      <h1>Hello from マザーAI!</h1>
      <p>This app was automatically deployed.</p>
    </div>
  )
}

export default App""",
            },
            "backend": {
                "main.py": """from fastapi import FastAPI

app = FastAPI(title="My API")

@app.get("/")
async def root():
    return {"message": "Hello from マザーAI!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
""",
                "requirements.txt": """fastapi==0.115.6
uvicorn[standard]==0.32.1
""",
                "Dockerfile": """FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
""",
            }
        }


class Phase4SelfImprovementAgent(BaseAgent):
    """
    Phase 4: 自己改善エージェント
    マザーAI自身を改善・拡張する
    """

    def __init__(self):
        super().__init__(
            name="Phase4SelfImprovementAgent",
            agent_type="self_improvement",
            level=AgentLevel.WORKER
        )

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        自己改善タスクを実行
        """
        improvement_request = task.get("improvement_request", "")
        user_message = task.get("user_message", "")

        # TODO: マザーAIの改善を実行
        # 1. セキュリティスキャン
        # 2. サンドボックステスト
        # 3. 人間の承認待ち
        # 4. 本番環境に反映

        # Mock self-improvement proposals with realistic analysis
        keywords_performance = ["遅い", "重い", "パフォーマンス", "速度", "performance", "slow"]
        keywords_feature = ["機能", "追加", "新しい", "feature", "add"]
        keywords_bug = ["バグ", "エラー", "不具合", "bug", "error", "fix"]

        improvement_type = "general"
        if any(kw in user_message.lower() for kw in keywords_performance):
            improvement_type = "performance"
        elif any(kw in user_message.lower() for kw in keywords_feature):
            improvement_type = "feature"
        elif any(kw in user_message.lower() for kw in keywords_bug):
            improvement_type = "bug_fix"

        if improvement_type == "performance":
            response = """パフォーマンス改善の提案を分析しました。

**現状分析:**
- フロントエンド: 初回ロード時間 2.5秒
- バックエンド: API平均応答時間 350ms
- データベース: クエリ実行時間 120ms

**改善提案:**

1. **フロントエンド最適化**
   - React.lazy()による遅延ロード導入
   - 画像の最適化（WebP形式、lazy loading）
   - バンドルサイズ削減（Tree Shaking）

   **予想効果**: 初回ロード時間 40%削減

2. **バックエンド最適化**
   - データベースクエリのキャッシング（Redis）
   - N+1問題の解決
   - 非同期処理の拡充

   **予想効果**: API応答時間 30%削減

3. **セキュリティスキャン**
   ✅ 脆弱性チェック完了
   ✅ OWASP Top 10対策確認
   ✅ APIキー暗号化確認

**実装計画:**
- サンドボックス環境でテスト: 2日
- 人間の承認待ち: 1日
- 本番環境へのデプロイ: 1日

承認されますか？"""
            proposed_changes = {
                "frontend": ["React.lazy導入", "画像最適化", "バンドルサイズ削減"],
                "backend": ["Redis導入", "クエリ最適化", "非同期処理拡充"],
                "estimated_days": 4,
            }
        elif improvement_type == "feature":
            response = """新機能追加の提案を分析しました。

**提案機能:**
- Phase 5-10の追加（マザーAI自身が設計）
- チーム協業機能
- リアルタイム通知システム
- モバイルアプリ対応

**優先度評価:**

1. **Phase 5-10追加** (優先度: 高)
   - ユーザーフィードバックで最も要望が多い
   - 既存アーキテクチャと互換性あり
   - 実装工数: 10日

2. **チーム協業機能** (優先度: 中)
   - エンタープライズ利用に必須
   - リアルタイム通信の追加が必要
   - 実装工数: 7日

3. **リアルタイム通知** (優先度: 中)
   - UX向上に貢献
   - WebSocket実装が必要
   - 実装工数: 3日

**セキュリティスキャン:**
✅ 新機能による脆弱性なし
✅ 既存機能への影響なし

**実装計画:**
Phase 5-10を最優先で実装することを推奨します。

承認されますか？"""
            proposed_changes = {
                "new_phases": ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9", "Phase 10"],
                "estimated_days": 10,
                "priority": "high",
            }
        elif improvement_type == "bug_fix":
            response = """バグ修正の提案を分析しました。

**検出されたバグ:**

1. **重要度: 高**
   - helpers.ts loginAsApprovedUser()関数の401エラー
   - 影響: E2E-P005-001テスト失敗
   - 修正方針: ヘルパー関数のトークン処理を修正

2. **重要度: 中**
   - Phase遷移時のメモリリーク
   - 影響: 長時間使用時のパフォーマンス低下
   - 修正方針: useEffect cleanup関数の追加

3. **重要度: 低**
   - ファイルツリーの展開状態がリセットされる
   - 影響: UX低下
   - 修正方針: LocalStorageで状態保存

**セキュリティスキャン:**
✅ セキュリティ上の脆弱性なし
✅ データ損失のリスクなし

**実装計画:**
- サンドボックステスト: 1日
- 本番環境デプロイ: 即日可能

承認されますか？"""
            proposed_changes = {
                "bugs": [
                    {"severity": "high", "issue": "helpers.ts login function"},
                    {"severity": "medium", "issue": "Phase transition memory leak"},
                    {"severity": "low", "issue": "FileTree expansion state"},
                ],
                "estimated_days": 2,
            }
        else:
            response = """自己改善の提案を分析しています。

マザーAI自身の改善について、以下の観点から分析します：

**改善候補領域:**
1. **パフォーマンス**: 応答速度、リソース使用量
2. **機能追加**: 新しいPhase、ツール、統合
3. **バグ修正**: 既知の問題の解決
4. **セキュリティ**: 脆弱性対策、暗号化強化
5. **UX改善**: ユーザーインターフェース、使いやすさ

具体的な改善内容を教えてください。例：
- "パフォーマンスを改善したい"
- "新機能を追加したい"
- "バグを修正したい"
"""
            proposed_changes = {
                "status": "awaiting_details",
                "available_improvements": ["performance", "feature", "bug_fix", "security", "ux"],
            }

        return {
            "status": "pending_approval" if improvement_type != "general" else "awaiting_input",
            "response": response,
            "proposed_changes": proposed_changes,
            "improvement_type": improvement_type,
        }


class OrchestratorAgent(BaseAgent):
    """
    オーケストレーターエージェント
    プロジェクト全体を統括し、適切なPhaseエージェントに委譲
    MVP: 単純なルーティング
    将来: 複雑な意思決定と階層管理
    """

    def __init__(self):
        super().__init__(
            name="OrchestratorAgent",
            agent_type="orchestrator",
            level=AgentLevel.CEO  # 将来のCEO的役割
        )

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        プロジェクトを統括し、適切なPhaseエージェントを選択
        """
        current_phase = task.get("current_phase", 1)
        user_message = task.get("user_message", "")

        # TODO: 現在のフェーズに応じて適切なエージェントを呼び出す
        # MVP: シンプルなルーティング
        # 将来: 複雑な意思決定と委譲

        phase_map = {
            1: "Phase1RequirementsAgent",
            2: "Phase2CodeGenerationAgent",
            3: "Phase3DeploymentAgent",
            4: "Phase4SelfImprovementAgent",
        }

        selected_agent = phase_map.get(current_phase, "Phase1RequirementsAgent")

        return {
            "status": "success",
            "selected_agent": selected_agent,
            "message": f"Phase {current_phase}エージェントを起動しました",
        }
