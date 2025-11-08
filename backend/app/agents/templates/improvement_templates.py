"""
自己改善提案テンプレート
Phase 4で使用する改善提案テンプレート集
"""

from typing import Dict, List


def generate_improvement_proposals(improvement_type: str = "general") -> Dict[str, any]:
    """
    改善提案を生成（モックモード）

    Args:
        improvement_type: 改善タイプ（performance, feature, bug_fix, security, general）

    Returns:
        改善提案の辞書
    """

    # 改善提案のベーステンプレート
    proposals_map = {
        "performance": {
            "title": "パフォーマンス最適化の提案",
            "summary": "マザーAIのパフォーマンスを向上させるための改善案を特定しました。",
            "improvements": [
                {
                    "id": "PERF-001",
                    "category": "Database",
                    "title": "N+1クエリ問題の解決",
                    "description": "プロジェクト一覧取得時に、メッセージとファイルを同時に取得することでデータベースクエリ数を削減できます。",
                    "priority": "high",
                    "estimated_improvement": "50%のレスポンス時間短縮",
                    "implementation": {
                        "file": "backend/app/api/projects.py",
                        "change_type": "refactor",
                        "code_example": """# 改善前
projects = db.query(Project).all()
for p in projects:
    p.messages = db.query(Message).filter(Message.project_id == p.id).all()

# 改善後
projects = db.query(Project).options(
    joinedload(Project.messages)
).all()"""
                    },
                    "risks": "低 - 既存機能を破壊しない",
                    "test_plan": "既存のE2Eテストで検証可能"
                },
                {
                    "id": "PERF-002",
                    "category": "Frontend",
                    "title": "React.memoによるレンダリング最適化",
                    "description": "PhaseCardコンポーネントをメモ化することで、不要な再レンダリングを防ぎます。",
                    "priority": "medium",
                    "estimated_improvement": "30%のレンダリング回数削減",
                    "implementation": {
                        "file": "frontend/src/components/PhaseCard.tsx",
                        "change_type": "optimize",
                        "code_example": """import { memo } from 'react';

export const PhaseCard = memo(({ phase, onClick }) => {
  // ...コンポーネント実装
});"""
                    },
                    "risks": "低 - 表示に影響なし",
                    "test_plan": "React DevTools Profilerで検証"
                },
                {
                    "id": "PERF-003",
                    "category": "API",
                    "title": "プロンプトキャッシングの最適化",
                    "description": "システムプロンプトのキャッシュTTLを延長し、キャッシュヒット率を向上させます。",
                    "priority": "high",
                    "estimated_improvement": "追加で20%のコスト削減",
                    "implementation": {
                        "file": "backend/app/agents/claude_client.py",
                        "change_type": "config",
                        "code_example": """# キャッシュTTLを5分から15分に延長
CACHE_TTL = 60 * 15  # 15分"""
                    },
                    "risks": "低 - コスト削減のみ",
                    "test_plan": "Claude API使用量ログで検証"
                }
            ],
            "estimated_total_impact": "70%のパフォーマンス向上、20%のコスト削減"
        },

        "feature": {
            "title": "新機能追加の提案",
            "summary": "ユーザーエクスペリエンスを向上させるための新機能案を特定しました。",
            "improvements": [
                {
                    "id": "FEAT-001",
                    "category": "Agents",
                    "title": "Phase 5: テスト自動生成エージェント",
                    "description": "Phase 2で生成したコードに対して、自動的にテストコードを生成するエージェントを追加します。",
                    "priority": "medium",
                    "estimated_value": "品質向上、デバッグ時間50%削減",
                    "implementation": {
                        "new_files": [
                            "backend/app/agents/phase5_test_agent.py",
                            "backend/app/agents/templates/test_templates.py"
                        ],
                        "change_type": "feature",
                        "scope": "Phase 5を追加（既存に影響なし）"
                    },
                    "risks": "低 - 新機能なので既存に影響なし",
                    "test_plan": "Phase 5専用のE2Eテストを追加"
                },
                {
                    "id": "FEAT-002",
                    "category": "Collaboration",
                    "title": "チーム協業機能",
                    "description": "複数ユーザーで同一プロジェクトを共同編集できる機能を追加します。",
                    "priority": "low",
                    "estimated_value": "エンタープライズ向け機能",
                    "implementation": {
                        "new_files": [
                            "backend/app/models/team.py",
                            "backend/app/api/teams.py",
                            "frontend/src/pages/TeamSettings.tsx"
                        ],
                        "change_type": "feature",
                        "scope": "データモデル拡張、新規API、新規UI"
                    },
                    "risks": "中 - 権限管理が複雑化",
                    "test_plan": "チーム機能専用のE2Eテスト"
                },
                {
                    "id": "FEAT-003",
                    "category": "Integration",
                    "title": "GitHub連携機能",
                    "description": "生成されたコードを直接GitHubリポジトリにプッシュする機能を追加します。",
                    "priority": "high",
                    "estimated_value": "ワークフロー効率化",
                    "implementation": {
                        "new_files": [
                            "backend/app/services/github_service.py",
                            "backend/app/api/github.py"
                        ],
                        "change_type": "integration",
                        "scope": "GitHub API連携"
                    },
                    "risks": "中 - OAuth認証が必要",
                    "test_plan": "GitHub APIモックでテスト"
                }
            ],
            "estimated_total_impact": "ユーザー満足度30%向上"
        },

        "bug_fix": {
            "title": "バグ修正の提案",
            "summary": "既知のバグと潜在的な問題を特定し、修正案を提示します。",
            "improvements": [
                {
                    "id": "BUG-001",
                    "category": "API",
                    "title": "SSEストリーム切断時のエラーハンドリング",
                    "description": "ネットワーク切断時にSSEストリームが適切にクリーンアップされない問題を修正します。",
                    "priority": "high",
                    "impact": "ユーザーがエラーに遭遇する確率を80%削減",
                    "implementation": {
                        "file": "frontend/src/services/projectService.ts",
                        "change_type": "bug_fix",
                        "code_example": """// 改善後: cleanup処理を追加
try {
  await reader.read();
} catch (error) {
  console.error('Stream error:', error);
  reader.releaseLock();
  // 再接続ロジック
}"""
                    },
                    "risks": "低 - エラーハンドリング改善のみ",
                    "test_plan": "ネットワーク切断シミュレーション"
                },
                {
                    "id": "BUG-002",
                    "category": "UI",
                    "title": "Monaco Editorのメモリリーク修正",
                    "description": "コンポーネントアンマウント時にMonaco Editorインスタンスが破棄されない問題を修正します。",
                    "priority": "medium",
                    "impact": "長時間使用時のメモリ使用量50%削減",
                    "implementation": {
                        "file": "frontend/src/components/CodeEditor.tsx",
                        "change_type": "bug_fix",
                        "code_example": """useEffect(() => {
  return () => {
    // cleanup
    if (editorRef.current) {
      editorRef.current.dispose();
    }
  };
}, []);"""
                    },
                    "risks": "低 - メモリ管理改善",
                    "test_plan": "Chrome DevTools Memory Profiler"
                }
            ],
            "estimated_total_impact": "システム安定性30%向上"
        },

        "security": {
            "title": "セキュリティ強化の提案",
            "summary": "セキュリティリスクを特定し、対策案を提示します。",
            "improvements": [
                {
                    "id": "SEC-001",
                    "category": "Authentication",
                    "title": "JWT有効期限の短縮",
                    "description": "現在24時間のJWT有効期限を1時間に短縮し、リフレッシュトークン機構を導入します。",
                    "priority": "high",
                    "security_impact": "トークン盗難時の被害を95%削減",
                    "implementation": {
                        "files": [
                            "backend/app/core/security.py",
                            "frontend/src/services/auth.ts"
                        ],
                        "change_type": "security",
                        "scope": "JWT + リフレッシュトークン"
                    },
                    "risks": "中 - 認証フロー変更",
                    "test_plan": "認証関連E2Eテスト全件"
                },
                {
                    "id": "SEC-002",
                    "category": "API",
                    "title": "レート制限の実装",
                    "description": "API呼び出しにレート制限を設定し、DoS攻撃を防ぎます。",
                    "priority": "high",
                    "security_impact": "DoS攻撃リスク90%削減",
                    "implementation": {
                        "file": "backend/app/middleware/rate_limit.py",
                        "change_type": "security",
                        "code_example": """from fastapi_limiter import RateLimiter

@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    # 1分間に60リクエストまで
    limiter = RateLimiter(times=60, seconds=60)
    return await limiter(request, call_next)"""
                    },
                    "risks": "低 - 正常なユーザーに影響なし",
                    "test_plan": "大量リクエストシミュレーション"
                },
                {
                    "id": "SEC-003",
                    "category": "Data",
                    "title": "APIキーの暗号化強化",
                    "description": "現在のFernet暗号化をAES-256-GCMに変更し、セキュリティレベルを向上させます。",
                    "priority": "medium",
                    "security_impact": "データ漏洩リスク50%削減",
                    "implementation": {
                        "file": "backend/app/core/encryption.py",
                        "change_type": "security",
                        "scope": "暗号化アルゴリズム変更"
                    },
                    "risks": "中 - 既存データの再暗号化が必要",
                    "test_plan": "暗号化・復号化テスト"
                }
            ],
            "estimated_total_impact": "セキュリティレベル80%向上"
        },

        "general": {
            "title": "マザーAI総合改善提案",
            "summary": "パフォーマンス、機能、バグ修正、セキュリティの全分野から改善案を特定しました。",
            "improvements": [
                {
                    "id": "GEN-001",
                    "category": "Performance",
                    "title": "データベースクエリ最適化",
                    "description": "N+1問題の解決とインデックス最適化",
                    "priority": "high"
                },
                {
                    "id": "GEN-002",
                    "category": "Feature",
                    "title": "Phase 5: テスト自動生成",
                    "description": "生成コードの品質向上",
                    "priority": "medium"
                },
                {
                    "id": "GEN-003",
                    "category": "Security",
                    "title": "レート制限実装",
                    "description": "DoS攻撃対策",
                    "priority": "high"
                },
                {
                    "id": "GEN-004",
                    "category": "Bug Fix",
                    "title": "SSEエラーハンドリング",
                    "description": "ネットワーク切断時の安定性向上",
                    "priority": "high"
                }
            ],
            "estimated_total_impact": "総合的なシステム品質50%向上"
        }
    }

    # 指定された改善タイプの提案を取得
    proposal = proposals_map.get(improvement_type, proposals_map["general"])

    # レスポンスメッセージを作成
    improvements_list = proposal["improvements"]
    improvements_summary = "\n".join([
        f"### {imp['id']}: {imp['title']}\n"
        f"- **優先度**: {imp['priority']}\n"
        f"- **説明**: {imp['description']}\n"
        for imp in improvements_list[:3]  # 最初の3件のみ詳細表示
    ])

    response_message = f"""## 🔍 {proposal['title']}

{proposal['summary']}

---

## 📋 改善提案一覧

{improvements_summary}

---

## 📊 予想される効果

{proposal.get('estimated_total_impact', '総合的なシステム改善')}

---

## ⚠️ 次のステップ

1. 各改善案を確認し、実装する項目を選択してください
2. 優先度の高い項目から順に実装することを推奨します
3. 実装前にテスト計画を確認してください

**注意**: これらの改善案は「マザーAI」Phase 4エージェントによって生成されました。
実装前に必ず人間による承認が必要です。
"""

    return {
        "status": "pending_approval",
        "response": response_message,
        "improvements": improvements_list,
        "improvement_type": improvement_type,
        "total_count": len(improvements_list),
    }
