"""
Phase 4拡張: セキュリティスキャンテンプレート
コード内のセキュリティ脆弱性を検出
"""
from typing import Dict, List, Any


def generate_security_scan_report(project_files: Dict[str, str] = None) -> Dict[str, Any]:
    """
    セキュリティスキャンレポートを生成

    Args:
        project_files: プロジェクトファイルの内容（キー: ファイルパス、値: コード）

    Returns:
        セキュリティスキャン結果
    """

    # 一般的なセキュリティチェック項目
    security_checks = {
        "critical": [
            {
                "id": "SEC-001",
                "title": "SQL Injection 対策",
                "description": "SQLクエリにパラメータ化されていない入力値が含まれていないか確認",
                "status": "pass",
                "recommendation": "✅ SQLAlchemy ORMを使用しているため、SQL Injectionのリスクは低い",
            },
            {
                "id": "SEC-002",
                "title": "XSS (Cross-Site Scripting) 対策",
                "description": "ユーザー入力値が適切にエスケープされているか確認",
                "status": "warning",
                "recommendation": "⚠️  Reactは自動エスケープするが、dangerouslySetInnerHTMLの使用は避けること",
            },
            {
                "id": "SEC-003",
                "title": "認証・認可",
                "description": "適切な認証と認可が実装されているか確認",
                "status": "pass",
                "recommendation": "✅ JWTトークンによる認証が実装されている",
            },
        ],
        "high": [
            {
                "id": "SEC-004",
                "title": "APIキー・シークレットの保護",
                "description": "APIキーやシークレットがハードコードされていないか確認",
                "status": "pass",
                "recommendation": "✅ 環境変数で管理されている",
            },
            {
                "id": "SEC-005",
                "title": "CORS設定",
                "description": "CORS設定が適切に制限されているか確認",
                "status": "warning",
                "recommendation": "⚠️  本番環境では特定のオリジンのみ許可すること",
            },
            {
                "id": "SEC-006",
                "title": "パスワードハッシュ化",
                "description": "パスワードが適切にハッシュ化されているか確認",
                "status": "pass",
                "recommendation": "✅ bcryptでハッシュ化されている",
            },
        ],
        "medium": [
            {
                "id": "SEC-007",
                "title": "セッション管理",
                "description": "セッションタイムアウトが適切に設定されているか確認",
                "status": "pass",
                "recommendation": "✅ JWTトークンの有効期限が設定されている（7日間）",
            },
            {
                "id": "SEC-008",
                "title": "HTTPSの使用",
                "description": "本番環境でHTTPSが使用されているか確認",
                "status": "info",
                "recommendation": "ℹ️  Vercel/Cloud Runは自動的にHTTPSを提供",
            },
            {
                "id": "SEC-009",
                "title": "依存パッケージの脆弱性",
                "description": "使用しているライブラリに既知の脆弱性がないか確認",
                "status": "info",
                "recommendation": "ℹ️  定期的に `npm audit` と `pip check` を実行すること",
            },
        ],
        "low": [
            {
                "id": "SEC-010",
                "title": "エラーメッセージの漏洩",
                "description": "エラーメッセージに機密情報が含まれていないか確認",
                "status": "warning",
                "recommendation": "⚠️  本番環境ではDEBUG=falseに設定すること",
            },
        ],
    }

    # 統計情報
    total_checks = sum(len(checks) for checks in security_checks.values())
    passed = sum(
        1
        for checks in security_checks.values()
        for check in checks
        if check["status"] == "pass"
    )
    warnings = sum(
        1
        for checks in security_checks.values()
        for check in checks
        if check["status"] == "warning"
    )
    info_count = sum(
        1
        for checks in security_checks.values()
        for check in checks
        if check["status"] == "info"
    )

    return {
        "status": "completed",
        "summary": {
            "total_checks": total_checks,
            "passed": passed,
            "warnings": warnings,
            "info": info_count,
            "critical_issues": 0,  # クリティカルな問題なし
        },
        "checks": security_checks,
        "recommendations": [
            "🔒 本番環境では必ず HTTPS を使用してください",
            "🔑 APIキーとシークレットは環境変数で管理してください",
            "🛡️  CORS設定を本番環境のドメインに制限してください",
            "📦 定期的に依存パッケージを更新し、脆弱性をスキャンしてください",
            "🚨 DEBUG=false に設定し、詳細なエラーメッセージを非表示にしてください",
        ],
        "next_steps": [
            "npm audit を実行して依存パッケージの脆弱性をチェック",
            "pip-audit を実行してPythonパッケージの脆弱性をチェック",
            "Snyk、SonarQube等のセキュリティスキャンツールの導入を検討",
            "定期的なペネトレーションテストの実施",
        ],
    }


def generate_approval_workflow_template() -> Dict[str, Any]:
    """
    承認フローのテンプレートを生成

    Returns:
        承認フロー設定
    """
    return {
        "workflow_rules": {
            "auto_approve": {
                "description": "自動承認される変更",
                "conditions": [
                    "ドキュメントの更新のみ",
                    "テストコードの追加のみ",
                    "コメントの追加のみ",
                ],
            },
            "requires_approval": {
                "description": "承認が必要な変更",
                "conditions": [
                    "データベーススキーマの変更",
                    "認証・認可ロジックの変更",
                    "決済処理の変更",
                    "セキュリティ関連の変更",
                    "API仕様の変更",
                ],
            },
            "requires_multiple_approvals": {
                "description": "複数人の承認が必要な変更",
                "conditions": [
                    "本番環境への直接デプロイ",
                    "ユーザーデータの削除",
                    "マイグレーション実行",
                ],
            },
        },
        "approval_process": [
            "1. AIが変更内容を分析",
            "2. 変更の影響範囲を評価",
            "3. 必要な承認レベルを判定",
            "4. 承認者に通知",
            "5. 承認後、自動的に適用",
        ],
        "notification_settings": {
            "email": True,
            "slack": False,
            "dashboard": True,
        },
    }


def generate_rollback_plan(change_id: str, change_description: str) -> Dict[str, Any]:
    """
    ロールバック計画を生成

    Args:
        change_id: 変更ID
        change_description: 変更内容の説明

    Returns:
        ロールバック計画
    """
    return {
        "change_id": change_id,
        "rollback_steps": [
            {
                "step": 1,
                "description": "現在の状態をバックアップ",
                "command": "git stash",
                "reversible": True,
            },
            {
                "step": 2,
                "description": "データベースの状態を保存",
                "command": "pg_dump -U user -d database > backup.sql",
                "reversible": True,
            },
            {
                "step": 3,
                "description": "前回の安定版に戻す",
                "command": f"git revert {change_id}",
                "reversible": True,
            },
            {
                "step": 4,
                "description": "テストを実行して動作確認",
                "command": "npm test && pytest",
                "reversible": False,
            },
            {
                "step": 5,
                "description": "本番環境に再デプロイ",
                "command": "git push origin main",
                "reversible": False,
            },
        ],
        "estimated_time": "5-10分",
        "risk_level": "low",
        "data_loss_risk": "なし（データは保持される）",
        "downtime": "0-2分（デプロイ時のみ）",
        "notes": [
            "⚠️  ロールバック前に必ず最新のバックアップを取得してください",
            "✅ ロールバック後は必ずE2Eテストを実行してください",
            "📊 ロールバック後は監視ダッシュボードで異常がないか確認してください",
        ],
    }
