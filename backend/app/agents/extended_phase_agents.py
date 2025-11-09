"""
拡張Phaseエージェント (Phase 5-14)
マザーAIの機能拡張エージェント群
"""

import os
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentLevel
from app.agents.claude_client import get_claude_client


class Phase5TestGenerationAgent(BaseAgent):
    """
    Phase 5: テスト自動生成エージェント
    Phase 2で生成したコードに対してテストコードを自動生成
    """

    def __init__(self):
        super().__init__(
            name="Phase5TestGenerationAgent",
            agent_type="test_generation",
            level=AgentLevel.WORKER
        )
        self.claude = get_claude_client()

        self.system_prompt = """あなたは「マザーAI」の Phase 5 テスト自動生成エージェントです。

あなたの役割:
- Phase 2で生成されたコードに対して、包括的なテストコードを自動生成する
- フロントエンド: Vitest + React Testing Library + Playwright
- バックエンド: pytest + pytest-cov
- テストカバレッジ80%以上を目標

テスト生成の原則:
- ユニットテスト: 各関数・コンポーネントを個別にテスト
- 統合テスト: API連携やDB操作をテスト
- E2Eテスト: ユーザーフローを包括的にテスト
- エッジケース: 境界値、エラー条件を網羅

出力フォーマット:
各テストファイルを以下の形式で出力:

```filepath
tests/test_example.py
```
```python
テストコード
```

必須テスト:
- 正常系テスト
- 異常系テスト（エラーハンドリング）
- 境界値テスト
- モックを使用した外部依存のテスト
"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        テスト生成タスクを実行
        """
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        if not use_real_ai:
            # モックモード: テンプレートベースでテストを生成
            from app.agents.templates.test_templates import generate_test_files

            project_name = task.get("project_context", {}).get("project_name", "My App")
            generated_code = task.get("generated_code", {})

            # テンプレートからテストファイルを生成
            test_files = generate_test_files(project_name, generated_code)

            # ファイル数をカウント
            test_count = len(test_files)

            response_message = f"""✅ **{project_name}のテストコードを生成しました！**

## 生成されたテストファイル ({test_count}個)

**フロントエンドテスト:**
- `vitest.config.ts` - Vitest設定
- `src/test/setup.ts` - テストセットアップ
- `src/test/utils.tsx` - テストユーティリティ
- `src/pages/Dashboard.test.tsx` - Dashboardテスト
- `src/pages/ItemList.test.tsx` - ItemListテスト
- `playwright.config.ts` - Playwright設定
- `e2e/dashboard.spec.ts` - Dashboard E2E
- `e2e/items.spec.ts` - Items E2E

**バックエンドテスト:**
- `pytest.ini` - pytest設定
- `tests/conftest.py` - テストフィクスチャ
- `tests/test_items.py` - Items APIテスト

**追加パッケージ:**
- `package.json.test-scripts` - テスト用npm scripts
- `requirements-test.txt` - テスト用Python依存関係

**ドキュメント:**
- `README_TESTING.md` - テスト実行ガイド

**テストカバレッジ目標:**
- フロントエンド: 80%以上
- バックエンド: 90%以上

**次のステップ:**
1. 依存関係をインストール
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd backend && pip install -r requirements-test.txt
   ```

2. テストを実行
   ```bash
   # Frontend
   npm run test
   npm run test:e2e

   # Backend
   pytest --cov=app
   ```

---
*このテストコードは「マザーAI」Phase 5エージェントによって自動生成されました。*
"""

            return {
                "status": "success",
                "response": response_message,
                "test_files": test_files,
                "test_count": test_count,
            }

        # リアルAIモード: Claude APIを使用
        generated_code = task.get("generated_code", {})
        user_message = task.get("user_message", "")
        project_context = task.get("project_context", {})

        test_prompt = f"""Phase 2で生成されたコードに対して、包括的なテストコードを生成してください。

**プロジェクト名**: {project_context.get('project_name', 'My App')}

**生成されたコード**:
- フロントエンド: {len(generated_code.get('frontend', {}))}ファイル
- バックエンド: {len(generated_code.get('backend', {}))}ファイル

**ユーザーの指示**:
{user_message if user_message else "標準的なテストを生成してください"}

以下を生成してください:
1. フロントエンド: Vitest + React Testing Library + Playwright
2. バックエンド: pytest + pytest-cov
3. テストカバレッジ80%以上を目指す
4. 正常系・異常系・境界値テストを含める
"""

        result = await self.claude.generate_text(
            messages=[{"role": "user", "content": test_prompt}],
            system_prompt=self.system_prompt,
            max_tokens=4096,
            temperature=0.2,
            use_cache=True
        )

        if "error" in result:
            return {
                "status": "error",
                "response": f"テスト生成エラー: {result['error']}",
                "test_files": {},
            }

        response_text = result["content"]

        # 生成されたテストコードをパース
        test_files = self._parse_test_code(response_text)

        return {
            "status": "success",
            "response": response_text,
            "test_files": test_files,
            "test_count": len(test_files),
            "usage": result.get("usage", {}),
            "cost": self.claude.estimate_cost(result.get("usage", {})),
        }

    def _parse_test_code(self, response_text: str) -> Dict[str, str]:
        """生成されたテストコードをパース"""
        import re

        test_files = {}
        pattern = r'```filepath\s*\n(.+?)\s*\n```\s*\n```(\w+)\s*\n(.+?)\n```'
        matches = re.findall(pattern, response_text, re.DOTALL)

        for filepath, language, code in matches:
            test_files[filepath.strip()] = code.strip()

        return test_files


class Phase6DocumentationAgent(BaseAgent):
    """
    Phase 6: ドキュメント生成エージェント
    プロジェクトのドキュメントを自動生成
    """

    def __init__(self):
        super().__init__(
            name="Phase6DocumentationAgent",
            agent_type="documentation",
            level=AgentLevel.WORKER
        )
        self.claude = get_claude_client()

        self.system_prompt = """あなたは「マザーAI」の Phase 6 ドキュメント生成エージェントです。

あなたの役割:
- プロジェクトの包括的なドキュメントを自動生成する
- README.md、API仕様書、アーキテクチャ図、ユーザーガイドなど
- 日本語でわかりやすく、初心者でも理解できる内容

ドキュメント生成の原則:
- 明確で簡潔な説明
- コード例を豊富に含める
- 図やフローチャートを活用
- よくある質問（FAQ）を含める

必須ドキュメント:
1. README.md - プロジェクト概要
2. API_REFERENCE.md - API仕様
3. ARCHITECTURE.md - アーキテクチャ説明
4. USER_GUIDE.md - ユーザーガイド
5. CONTRIBUTING.md - 貢献ガイド
6. CHANGELOG.md - 変更履歴
"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        ドキュメント生成タスクを実行
        """
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            # モックモード: テンプレートベースでドキュメントを生成
            docs = self._generate_mock_documentation(project_name)

            response_message = f"""✅ **{project_name}のドキュメントを生成しました！**

## 生成されたドキュメント

- `README.md` - プロジェクト概要と始め方
- `API_REFERENCE.md` - API仕様書
- `ARCHITECTURE.md` - システムアーキテクチャ
- `USER_GUIDE.md` - ユーザーガイド
- `CONTRIBUTING.md` - 貢献ガイド
- `CHANGELOG.md` - 変更履歴

---
*このドキュメントは「マザーAI」Phase 6エージェントによって自動生成されました。*
"""

            return {
                "status": "success",
                "response": response_message,
                "documentation": docs,
                "doc_count": len(docs),
            }

        # リアルAIモード（省略）
        return {"status": "success", "response": "Phase 6: Documentation (Real AI mode not implemented)"}

    def _generate_mock_documentation(self, project_name: str) -> Dict[str, str]:
        """モックドキュメント生成"""
        safe_name = project_name.lower().replace(" ", "-")

        return {
            "README.md": f"""# {project_name}

**自動生成されたフルスタックアプリケーション**

## 概要

このプロジェクトは「マザーAI」によって自動生成されました。
React + FastAPI を使用したモダンなフルスタックアプリケーションです。

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- MUI v6
- Vite 5
- React Router v6
- TanStack Query

### バックエンド
- Python 3.12
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL

## セットアップ

### 前提条件
- Node.js 20+
- Python 3.12+
- PostgreSQL 14+

### インストール

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 開発

```bash
# テスト実行
npm run test        # フロントエンド
pytest              # バックエンド

# ビルド
npm run build       # フロントエンド
```

## デプロイ

```bash
./deploy.sh
```

詳細は `README_DEPLOY.md` を参照してください。

## ライセンス

MIT

---
*このREADMEは「マザーAI」Phase 6エージェントによって自動生成されました。*
""",

            "API_REFERENCE.md": f"""# {project_name} - API リファレンス

## ベースURL

```
http://localhost:8000
```

## エンドポイント一覧

### Items

#### GET /api/items
アイテム一覧を取得

**レスポンス:**
```json
[
  {{
    "id": 1,
    "name": "Item 1",
    "description": "Description",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }}
]
```

#### POST /api/items
新規アイテムを作成

**リクエストボディ:**
```json
{{
  "name": "New Item",
  "description": "Description"
}}
```

#### GET /api/items/{{id}}
特定のアイテムを取得

#### PUT /api/items/{{id}}
アイテムを更新

#### DELETE /api/items/{{id}}
アイテムを削除

---
*このAPIリファレンスは「マザーAI」Phase 6エージェントによって自動生成されました。*
""",

            "ARCHITECTURE.md": f"""# {project_name} - アーキテクチャ

## システム構成

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │─────▶│   Backend   │─────▶│  Database   │
│ React + MUI │      │   FastAPI   │      │ PostgreSQL  │
└─────────────┘      └─────────────┘      └─────────────┘
```

## ディレクトリ構造

### フロントエンド
```
frontend/
├── src/
│   ├── components/    # 再利用可能なコンポーネント
│   ├── pages/         # ページコンポーネント
│   ├── hooks/         # カスタムフック
│   ├── lib/           # ユーティリティ
│   └── types/         # 型定義
```

### バックエンド
```
backend/
├── app/
│   ├── api/           # APIエンドポイント
│   ├── models/        # データモデル
│   ├── schemas/       # Pydanticスキーマ
│   └── routes/        # ルート定義
```

## データフロー

1. ユーザーがフロントエンドで操作
2. React QueryがAPIリクエスト
3. FastAPIがリクエストを処理
4. SQLAlchemyでDB操作
5. レスポンスをJSON形式で返却

---
*このアーキテクチャドキュメントは「マザーAI」Phase 6エージェントによって自動生成されました。*
""",
        }


# Phase 7-14はコンパクトに実装
class Phase7DebugAgent(BaseAgent):
    """Phase 7: デバッグ支援エージェント"""

    def __init__(self):
        super().__init__(name="Phase7DebugAgent", agent_type="debug", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

        self.system_prompt = """あなたは「マザーAI」のPhase 7デバッグ支援エージェントです。

コードの問題を自動検出し、修正提案を行います。
- コードスメル検出
- 潜在的なバグ発見
- パフォーマンス問題の特定
- ベストプラクティス提案
"""

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'

        project_name = task.get("project_context", {}).get("project_name", "My App")
        generated_code = task.get("generated_code", {})

        if not use_real_ai:
            # モックモード
            from app.agents.templates.extended_templates import generate_debug_report

            debug_files = generate_debug_report(project_name, generated_code)

            response_message = f"""✅ **{project_name}のデバッグ支援レポートを生成しました！**

## 検出された問題

### コードスメル: 3箇所
- 未使用のインポート
- デッドコード

### 潜在的なバグ: 5箇所
- Null参照の可能性
- 型安全性の問題

### パフォーマンス問題: 4箇所
- 不要な再レンダリング
- メモリリーク

詳細はDEBUG_REPORT.mdをご確認ください。

---
*Phase 7デバッグ支援エージェントより*
"""

            return {
                "status": "success",
                "response": response_message,
                "debug_files": debug_files,
            }

        # リアルAIモード（省略）
        return {"status": "success", "response": "Phase 7: Debug (Real AI mode not implemented)"}


class Phase8PerformanceAgent(BaseAgent):
    """Phase 8: パフォーマンス最適化エージェント"""

    def __init__(self):
        super().__init__(name="Phase8PerformanceAgent", agent_type="performance", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_performance_report
            report_files = generate_performance_report(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のパフォーマンス最適化レポートを生成しました！**\n\nLighthouse スコア: 72/100\n改善提案: バンドルサイズ削減、画像最適化、API応答時間短縮",
                "report_files": report_files,
            }

        return {"status": "success", "response": "Phase 8: Performance (Real AI mode not implemented)"}


class Phase9SecurityAgent(BaseAgent):
    """Phase 9: セキュリティ監査エージェント"""

    def __init__(self):
        super().__init__(name="Phase9SecurityAgent", agent_type="security", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_security_audit
            audit_files = generate_security_audit(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のセキュリティ監査レポートを生成しました！**\n\nセキュリティスコア: B+ (82/100)\n高リスク: SQLインジェクション、JWT秘密鍵\n中リスク: XSS、CORS設定",
                "audit_files": audit_files,
            }

        return {"status": "success", "response": "Phase 9: Security (Real AI mode not implemented)"}


class Phase10DatabaseAgent(BaseAgent):
    """Phase 10: データベース設計エージェント"""

    def __init__(self):
        super().__init__(name="Phase10DatabaseAgent", agent_type="database", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_database_schema
            schema_files = generate_database_schema(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のデータベース設計書を生成しました！**\n\nER図、テーブル設計、最適化提案、マイグレーションスクリプトを含みます。",
                "schema_files": schema_files,
            }

        return {"status": "success", "response": "Phase 10: Database (Real AI mode not implemented)"}


class Phase11APIDesignAgent(BaseAgent):
    """Phase 11: API設計エージェント"""

    def __init__(self):
        super().__init__(name="Phase11APIDesignAgent", agent_type="api_design", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_api_design
            api_files = generate_api_design(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のAPI設計書を生成しました！**\n\nOpenAPI 3.0仕様、エンドポイント一覧、エラーコード、ベストプラクティスを含みます。",
                "api_files": api_files,
            }

        return {"status": "success", "response": "Phase 11: API Design (Real AI mode not implemented)"}


class Phase12UXAgent(BaseAgent):
    """Phase 12: UI/UXレビューエージェント"""

    def __init__(self):
        super().__init__(name="Phase12UXAgent", agent_type="ux_review", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_ux_review
            review_files = generate_ux_review(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のUX/UIレビューレポートを生成しました！**\n\n総合評価: B+ (85/100)\nクリティカル問題: アクセシビリティ、モバイル対応\n改善推奨: フィードバック強化、エラーメッセージ改善",
                "review_files": review_files,
            }

        return {"status": "success", "response": "Phase 12: UX Review (Real AI mode not implemented)"}


class Phase13RefactoringAgent(BaseAgent):
    """Phase 13: リファクタリングエージェント"""

    def __init__(self):
        super().__init__(name="Phase13RefactoringAgent", agent_type="refactoring", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")
        generated_code = task.get("generated_code", {})

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_refactoring_plan
            plan_files = generate_refactoring_plan(project_name, generated_code)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のリファクタリング計画を生成しました！**\n\nコード品質評価: B (78/100)\n優先度高: 重複コード削除、長い関数の分割、マジックナンバー定数化",
                "plan_files": plan_files,
            }

        return {"status": "success", "response": "Phase 13: Refactoring (Real AI mode not implemented)"}


class Phase14MonitoringAgent(BaseAgent):
    """Phase 14: モニタリング・運用エージェント"""

    def __init__(self):
        super().__init__(name="Phase14MonitoringAgent", agent_type="monitoring", level=AgentLevel.WORKER)
        self.claude = get_claude_client()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        use_real_ai = os.getenv('USE_REAL_AI', 'false').lower() == 'true'
        project_name = task.get("project_context", {}).get("project_name", "My App")

        if not use_real_ai:
            from app.agents.templates.extended_templates import generate_monitoring_setup
            monitoring_files = generate_monitoring_setup(project_name)

            return {
                "status": "success",
                "response": f"✅ **{project_name}のモニタリング設定を生成しました！**\n\nPrometheus設定、Grafanaダッシュボード、アラート設定、ヘルスチェック、APM設定を含みます。",
                "monitoring_files": monitoring_files,
            }

        return {"status": "success", "response": "Phase 14: Monitoring (Real AI mode not implemented)"}
