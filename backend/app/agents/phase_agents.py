import os
from typing import Dict, Any, List
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
        self.claude = get_claude_client()

        # システムプロンプト（プロンプトキャッシング対象）
        self.system_prompt = """あなたは「マザーAI」の Phase 2 コード生成エージェントです。

あなたの役割:
- Phase 1で定義された要件に基づいて、完全に動作するフルスタックアプリケーションのコードを生成する
- フロントエンド: React 18 + TypeScript + MUI v6 + Vite
- バックエンド: FastAPI + SQLAlchemy 2.0 + PostgreSQL
- 本番環境で即座にデプロイ可能な品質

コード生成の原則:
- TypeScript strictモード対応
- エラーハンドリング完備
- レスポンシブデザイン
- セキュリティベストプラクティス（XSS、SQLインジェクション対策）
- コメントは日本語で記述

出力フォーマット:
1. ユーザーへの説明（生成したファイルの概要）
2. 各ファイルを以下の形式で出力:

```filepath
ファイルパス（例: frontend/src/App.tsx）
```
```language
コード内容
```

必須ファイル（フロントエンド）:
- package.json
- tsconfig.json
- vite.config.ts
- index.html
- src/main.tsx
- src/App.tsx
- src/pages/* （必要なページ）
- src/components/* （必要なコンポーネント）

必須ファイル（バックエンド）:
- requirements.txt
- main.py
- models.py
- routes/* （必要なルート）
- Dockerfile"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        コード生成タスクを実行
        """
        # モックモードチェック（デフォルト: モックモード）
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        if not use_real_ai:
            # モックモード: テンプレートベースで実用的なコードを生成
            from app.agents.templates.code_templates import generate_project_code

            project_name = task.get("project_context", {}).get("project_name", "My App")
            user_message = task.get("user_message", "")

            # テンプレートからコードを生成
            generated_code = generate_project_code(project_name, user_message)

            # ファイル数をカウント
            frontend_count = len(generated_code.get("frontend", {}))
            backend_count = len(generated_code.get("backend", {}))
            total_count = frontend_count + backend_count

            # レスポンスメッセージを作成
            response_message = f"""✅ **{project_name}のコードを生成しました！**

## 生成されたファイル

**フロントエンド** ({frontend_count}ファイル):
- React + TypeScript + MUI v6
- Vite 5によるモダンなビルド環境
- React Router v6でルーティング
- TanStack Query (React Query)でデータフェッチ
- レスポンシブ対応

**バックエンド** ({backend_count}ファイル):
- FastAPI + SQLAlchemy 2.0
- PostgreSQL対応
- RESTful API設計
- Pydanticによるバリデーション
- Docker対応

**次のステップ:**
1. Phase 3でデプロイスクリプトを生成
2. 本番環境にデプロイ

---
*このコードは「マザーAI」Phase 2エージェントによって自動生成されました。*
"""

            return {
                "status": "success",
                "response": response_message,
                "generated_code": generated_code,
                "file_count": total_count,
            }

        # リアルAIモード: Claude APIを使用
        requirements = task.get("requirements", {})
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})
        conversation_history = task.get("conversation_history", [])

        # 会話履歴から要件を抽出
        requirements_summary = self._extract_requirements_from_history(conversation_history)

        # コード生成プロンプトを構築
        code_generation_prompt = f"""Phase 1の要件定義に基づいて、フルスタックアプリケーションのコードを生成してください。

**プロジェクト名**: {project_context.get('project_name', 'My App')}

**要件サマリー**:
{requirements_summary}

**ユーザーの追加指示**:
{user_message}

上記の要件を満たす、完全に動作するアプリケーションコードを生成してください。
フロントエンド（React + TypeScript）とバックエンド（FastAPI）の両方を含めてください。"""

        # Claude APIでコード生成
        result = await self.claude.generate_text(
            messages=[{"role": "user", "content": code_generation_prompt}],
            system_prompt=self.system_prompt,
            max_tokens=4096,
            temperature=0.3,  # コード生成なので低めの温度
            use_cache=True
        )

        if "error" in result:
            return {
                "status": "error",
                "response": f"コード生成エラー: {result['error']}",
                "generated_code": {},
            }

        # 生成されたコードをパース
        response_text = result["content"]
        generated_files = self._parse_generated_code(response_text)

        # ファイルが生成されなかった場合はモックコードを使用
        if not generated_files or len(generated_files.get("frontend", {})) == 0:
            generated_files = self._get_mock_files()
            response_text = "コードを生成しました！（Claude APIからの応答をパースできなかったため、サンプルコードを使用しています）\n\n" + response_text

        # ファイル数をカウント
        file_count = sum(len(files) for files in generated_files.values())

        return {
            "status": "success",
            "response": response_text,
            "generated_code": generated_files,
            "file_count": file_count,
            "usage": result.get("usage", {}),
            "cost": self.claude.estimate_cost(result.get("usage", {})),
        }

    def _extract_requirements_from_history(self, conversation_history: List[Dict[str, str]]) -> str:
        """会話履歴から要件を抽出してサマリーを作成"""
        if not conversation_history:
            return "要件定義がまだ完了していません。Phase 1で要件を定義してください。"

        # 会話履歴をテキストに変換
        summary_parts = []
        for msg in conversation_history[-10:]:  # 最新10件のみ
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user":
                summary_parts.append(f"- {content}")

        if summary_parts:
            return "\n".join(summary_parts)
        else:
            return "ユーザーが作りたいアプリケーションについて説明してください。"

    def _parse_generated_code(self, response_text: str) -> Dict[str, Dict[str, str]]:
        """
        Claude APIの応答からコードを抽出

        期待される形式:
        ```filepath
        frontend/src/App.tsx
        ```
        ```typescript
        コード内容
        ```
        """
        import re

        files = {"frontend": {}, "backend": {}}

        # ファイルパスとコードブロックを抽出
        pattern = r'```filepath\s*\n(.+?)\s*\n```\s*\n```(\w+)\s*\n(.+?)\n```'
        matches = re.findall(pattern, response_text, re.DOTALL)

        for filepath, language, code in matches:
            filepath = filepath.strip()
            code = code.strip()

            # フロントエンドかバックエンドか判定
            if filepath.startswith("frontend/"):
                clean_path = filepath.replace("frontend/", "")
                files["frontend"][clean_path] = code
            elif filepath.startswith("backend/"):
                clean_path = filepath.replace("backend/", "")
                files["backend"][clean_path] = code
            else:
                # プレフィックスがない場合、拡張子で判定
                if any(filepath.endswith(ext) for ext in [".tsx", ".ts", ".jsx", ".js", ".html", ".json"]):
                    files["frontend"][filepath] = code
                else:
                    files["backend"][filepath] = code

        return files

    def _get_mock_files(self) -> Dict[str, Dict[str, str]]:
        """モックファイル（パース失敗時のフォールバック）"""
        return {
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


class Phase3DeploymentAgent(BaseAgent):
    """
    Phase 3: デプロイエージェント
    デプロイスクリプトを生成してユーザーに提供
    """

    def __init__(self):
        super().__init__(
            name="Phase3DeploymentAgent",
            agent_type="deployment",
            level=AgentLevel.WORKER
        )
        self.claude = get_claude_client()

        # システムプロンプト
        self.system_prompt = """あなたは「マザーAI」の Phase 3 デプロイエージェントです。

あなたの役割:
- Phase 2で生成されたコードを本番環境にデプロイするためのスクリプトを生成する
- フロントエンド: Vercel
- バックエンド: Google Cloud Run
- データベース: Supabase/Neon PostgreSQL

生成するスクリプト:
1. **deploy.sh**: メインデプロイスクリプト
2. **vercel.json**: Vercel設定ファイル
3. **Dockerfile**: Cloud Run用Dockerファイル
4. **.env.production.template**: 環境変数テンプレート
5. **README_DEPLOY.md**: デプロイ手順書

スクリプトの要件:
- シェルスクリプトは`#!/bin/bash`で開始
- エラーハンドリング（set -e）必須
- 環境変数チェック
- わかりやすいログ出力
- ロールバック手順も記載

出力フォーマット:
各ファイルを以下の形式で出力:

```filepath
ファイルパス（例: deploy.sh）
```
```language
ファイル内容
```

日本語でわかりやすく説明してください。"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        デプロイスクリプトを生成
        """
        # モックモードチェック（デフォルト: モックモード）
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        if not use_real_ai:
            # モックモード: テンプレートベースで実用的なデプロイスクリプトを生成
            from app.agents.templates.deployment_templates import generate_deployment_scripts

            project_name = task.get("project_context", {}).get("project_name", "My App")

            # テンプレートからデプロイスクリプトを生成
            deployment_scripts = generate_deployment_scripts(project_name)

            # スクリプト数をカウント
            script_count = len(deployment_scripts)

            # レスポンスメッセージを作成
            response_message = f"""✅ **{project_name}のデプロイスクリプトを生成しました！**

## 生成されたファイル ({script_count}個)

**デプロイスクリプト:**
- `deploy.sh`: Vercel + Cloud Run自動デプロイ
- `.env.production.template`: 環境変数テンプレート
- `DEPLOYMENT_CHECKLIST.md`: デプロイ前確認事項

**Vercel設定:**
- `vercel.json`: Vercel設定ファイル

**Docker設定:**
- `Dockerfile`: Cloud Run用Dockerイメージ
- `.dockerignore`: Docker除外設定

**CI/CD（GitHub Actions）:**
- `.github/workflows/deploy.yml`: 本番環境デプロイ
- `.github/workflows/test.yml`: テスト自動実行

**ドキュメント:**
- `README_DEPLOY.md`: 詳細なデプロイ手順書

**次のステップ:**
1. `.env.production.template` をコピーして `.env.production` を作成
2. 必要な環境変数を設定
3. `chmod +x deploy.sh && ./deploy.sh` でデプロイ実行

---
*このデプロイ設定は「マザーAI」Phase 3エージェントによって自動生成されました。*
"""

            return {
                "status": "success",
                "response": response_message,
                "deployment_scripts": deployment_scripts,
                "script_count": script_count,
            }

        # リアルAIモード: Claude APIを使用
        generated_code = task.get("generated_code", {})
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})
        project_name = project_context.get("project_name", "my-project")

        # プロジェクト名を安全な形式に変換
        safe_project_name = project_name.lower().replace(" ", "-").replace("_", "-")

        # Phase 2で生成されたコードのサマリーを作成
        frontend_files = generated_code.get("frontend", {})
        backend_files = generated_code.get("backend", {})
        code_summary = f"""フロントエンド: {len(frontend_files)}ファイル
バックエンド: {len(backend_files)}ファイル"""

        # デプロイスクリプト生成プロンプト
        deployment_prompt = f"""プロジェクト「{project_name}」のデプロイスクリプトを生成してください。

**プロジェクト情報:**
- プロジェクト名: {project_name}
- 安全な名前: {safe_project_name}
- 生成されたコード: {code_summary}

**ユーザーの指示:**
{user_message if user_message else "標準的なデプロイスクリプトを生成してください"}

以下を生成してください:
1. deploy.sh: Vercel + Cloud Runへのデプロイスクリプト
2. vercel.json: Vercel設定
3. Dockerfile: Cloud Run用
4. .env.production.template: 環境変数テンプレート
5. README_DEPLOY.md: デプロイ手順書（日本語）"""

        # Claude APIでデプロイスクリプト生成
        result = await self.claude.generate_text(
            messages=[{"role": "user", "content": deployment_prompt}],
            system_prompt=self.system_prompt,
            max_tokens=4096,
            temperature=0.2,
            use_cache=True
        )

        if "error" in result:
            return {
                "status": "error",
                "response": f"デプロイスクリプト生成エラー: {result['error']}",
            }

        response_text = result["content"]

        # 生成されたスクリプトをパース（Phase 2と同じロジック）
        deployment_files = self._parse_deployment_scripts(response_text)

        return {
            "status": "success",
            "response": response_text,
            "deployment_scripts": deployment_files,
            "script_count": len(deployment_files),
            "usage": result.get("usage", {}),
            "cost": self.claude.estimate_cost(result.get("usage", {})),
        }

    def _parse_deployment_scripts(self, response_text: str) -> Dict[str, str]:
        """デプロイスクリプトをパース"""
        import re

        scripts = {}
        pattern = r'```filepath\s*\n(.+?)\s*\n```\s*\n```(\w+)\s*\n(.+?)\n```'
        matches = re.findall(pattern, response_text, re.DOTALL)

        for filepath, language, content in matches:
            scripts[filepath.strip()] = content.strip()

        return scripts

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
        self.claude = get_claude_client()

        # システムプロンプト
        self.system_prompt = """あなたは「マザーAI」の Phase 4 自己改善エージェントです。

あなたの役割:
- マザーAI自身のコードやシステムを分析して改善提案を行う
- パフォーマンス、機能追加、バグ修正、セキュリティなど多角的に分析
- 実装可能な具体的な改善案を提示
- セキュリティリスクを評価

改善の種類:
1. **パフォーマンス改善**: 速度、メモリ、リソース使用量の最適化
2. **機能追加**: 新しいPhase、ツール、統合の提案
3. **バグ修正**: 既知の問題の特定と修正案
4. **セキュリティ強化**: 脆弱性対策、暗号化、認証の改善
5. **UX改善**: ユーザーインターフェースの使いやすさ向上

出力フォーマット:
1. **現状分析**: 現在の状態を評価
2. **改善提案**: 具体的な改善案（優先度付き）
3. **セキュリティスキャン**: 提案による影響評価
4. **実装計画**: 必要な工数と手順
5. **承認確認**: ユーザーに承認を求める

日本語でわかりやすく説明してください。"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        自己改善タスクを実行
        """
        # モックモードチェック（デフォルト: モックモード）
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        if not use_real_ai:
            # モックモード: テンプレートベースで実用的な改善提案を生成
            from app.agents.templates.improvement_templates import generate_improvement_proposals

            user_message = task.get("user_message", "")

            # ユーザーメッセージから改善タイプを推定
            improvement_type = self._estimate_improvement_type(user_message)

            # テンプレートから改善提案を生成
            proposal = generate_improvement_proposals(improvement_type)

            return proposal

        # リアルAIモード: Claude APIを使用
        improvement_request = task.get("improvement_request", "")
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})

        # 改善提案生成プロンプト
        improvement_prompt = f"""マザーAI自身の改善について分析してください。

**ユーザーのリクエスト:**
{user_message}

**プロジェクトコンテキスト:**
{improvement_request if improvement_request else '特定の要件なし'}

マザーAIの改善案を分析して提示してください。以下の観点から評価してください：
- パフォーマンス最適化
- 新機能追加
- バグ修正
- セキュリティ強化
- UX改善

具体的な実装案と予想される効果を示してください。"""

        # Claude APIで改善提案を生成
        result = await self.claude.generate_text(
            messages=[{"role": "user", "content": improvement_prompt}],
            system_prompt=self.system_prompt,
            max_tokens=3072,
            temperature=0.5,
            use_cache=True
        )

        if "error" in result:
            return {
                "status": "error",
                "response": f"改善提案生成エラー: {result['error']}",
            }

        response_text = result["content"]

        # 改善タイプを推定（キーワードベース）
        improvement_type = self._estimate_improvement_type(user_message)

        return {
            "status": "pending_approval",
            "response": response_text,
            "improvement_type": improvement_type,
            "usage": result.get("usage", {}),
            "cost": self.claude.estimate_cost(result.get("usage", {})),
        }

    def _estimate_improvement_type(self, user_message: str) -> str:
        """ユーザーメッセージから改善タイプを推定"""
        keywords_performance = ["遅い", "重い", "パフォーマンス", "速度", "performance", "slow"]
        keywords_feature = ["機能", "追加", "新しい", "feature", "add"]
        keywords_bug = ["バグ", "エラー", "不具合", "bug", "error", "fix"]
        keywords_security = ["セキュリティ", "脆弱性", "security", "vulnerability"]

        msg_lower = user_message.lower()

        if any(kw in msg_lower for kw in keywords_performance):
            return "performance"
        elif any(kw in msg_lower for kw in keywords_feature):
            return "feature"
        elif any(kw in msg_lower for kw in keywords_bug):
            return "bug_fix"
        elif any(kw in msg_lower for kw in keywords_security):
            return "security"
        else:
            return "general"


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
