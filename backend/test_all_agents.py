"""
Phase 1-14 エージェント動作確認テストスクリプト
全エージェントの動作を検証し、結果をレポート
"""

import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.dirname(__file__))

# .envファイルを読み込み
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

from app.agents import initialize_agents, AgentRegistry


async def test_phase_agent(phase_number: int, agent_name: str):
    """
    指定されたPhaseエージェントをテスト
    """
    print(f"\n{'='*60}")
    print(f"Phase {phase_number}: {agent_name}")
    print(f"{'='*60}")

    try:
        agent = AgentRegistry.get_agent(agent_name)

        if not agent:
            print(f"❌ エージェントが見つかりません: {agent_name}")
            return {
                "phase": phase_number,
                "agent_name": agent_name,
                "status": "error",
                "error": "Agent not found"
            }

        # テスト用のタスクデータ
        test_task = {
            "user_message": f"Phase {phase_number}の動作確認テストです",
            "project_context": {
                "project_id": "test-project-001",
                "project_name": "Test Project",
                "description": "テストプロジェクト",
            },
            "generated_code": {
                "frontend": {
                    "src/App.tsx": "// Sample code",
                    "package.json": "{}",
                },
                "backend": {
                    "main.py": "# Sample code",
                    "requirements.txt": "",
                }
            },
            "phase": phase_number,
        }

        # エージェント実行
        print(f"⏳ {agent_name}を実行中...")
        start_time = datetime.now()
        result = await agent.execute(test_task)
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()

        # 結果確認 (success または pending_approval を成功とみなす)
        if result.get("status") in ["success", "pending_approval"]:
            print(f"✅ 実行成功 ({execution_time:.2f}秒)")
            if result.get("status") == "pending_approval":
                print(f"⚠️  承認待ち (Phase 4自己改善)")
            print(f"📝 レスポンス:")
            response = result.get("response", "")
            # レスポンスが長い場合は最初の500文字のみ表示
            if len(response) > 500:
                print(response[:500] + "...\n(以下省略)")
            else:
                print(response)

            # 追加情報を表示
            if "file_count" in result:
                print(f"📁 生成ファイル数: {result['file_count']}")
            if "test_count" in result:
                print(f"🧪 テストファイル数: {result['test_count']}")
            if "doc_count" in result:
                print(f"📚 ドキュメント数: {result['doc_count']}")
            if "total_count" in result:
                print(f"📊 提案数: {result['total_count']}")

            return {
                "phase": phase_number,
                "agent_name": agent_name,
                "status": "success",
                "execution_time": execution_time,
                "result": result,
            }
        else:
            print(f"❌ 実行エラー")
            print(f"エラー内容: {result.get('response', 'Unknown error')}")
            return {
                "phase": phase_number,
                "agent_name": agent_name,
                "status": "error",
                "error": result.get("response", "Unknown error"),
                "execution_time": execution_time,
            }

    except Exception as e:
        print(f"❌ 例外エラー: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "phase": phase_number,
            "agent_name": agent_name,
            "status": "exception",
            "error": str(e),
        }


async def main():
    """
    全エージェントのテストを実行
    """
    print("\n" + "="*60)
    print("Phase 1-14 エージェント動作確認テスト")
    print("="*60)
    print(f"開始時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("環境: モックモード (USE_REAL_AI=false)")
    print("="*60)

    # エージェント初期化
    print("\n⏳ エージェントを初期化中...")
    initialize_agents()

    # 全エージェントリスト
    all_agents = [
        (1, "phase1"),
        (2, "phase2"),
        (3, "phase3"),
        (4, "phase4"),
        (5, "phase5"),
        (6, "phase6"),
        (7, "phase7"),
        (8, "phase8"),
        (9, "phase9"),
        (10, "phase10"),
        (11, "phase11"),
        (12, "phase12"),
        (13, "phase13"),
        (14, "phase14"),
    ]

    # 各エージェントをテスト
    results = []
    for phase_number, agent_name in all_agents:
        result = await test_phase_agent(phase_number, agent_name)
        results.append(result)

        # 1秒待機（連続実行を避ける）
        await asyncio.sleep(0.5)

    # サマリーレポート
    print("\n" + "="*60)
    print("テスト結果サマリー")
    print("="*60)

    success_count = sum(1 for r in results if r["status"] == "success")
    error_count = sum(1 for r in results if r["status"] == "error")
    exception_count = sum(1 for r in results if r["status"] == "exception")
    total_count = len(results)

    print(f"✅ 成功: {success_count}/{total_count}")
    print(f"❌ エラー: {error_count}/{total_count}")
    print(f"💥 例外: {exception_count}/{total_count}")

    # 詳細テーブル
    print("\n" + "-"*60)
    print(f"{'Phase':<7} {'エージェント名':<25} {'ステータス':<10} {'時間':<8}")
    print("-"*60)

    for result in results:
        phase = f"Phase {result['phase']}"
        agent_name = result['agent_name']
        status = result['status']
        execution_time = result.get('execution_time', 0)

        status_emoji = {
            "success": "✅",
            "error": "❌",
            "exception": "💥"
        }.get(status, "❓")

        print(f"{phase:<7} {agent_name:<25} {status_emoji} {status:<9} {execution_time:.2f}s")

    print("-"*60)

    # エラー詳細
    if error_count > 0 or exception_count > 0:
        print("\n⚠️ エラー詳細:")
        for result in results:
            if result["status"] in ["error", "exception"]:
                print(f"\nPhase {result['phase']} ({result['agent_name']}):")
                print(f"  {result.get('error', 'Unknown error')}")

    # 終了時刻
    print(f"\n終了時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    # 結果を返す
    return {
        "total": total_count,
        "success": success_count,
        "error": error_count,
        "exception": exception_count,
        "results": results,
    }


if __name__ == "__main__":
    # 環境変数を設定（モックモード）
    os.environ["USE_REAL_AI"] = "false"

    # テスト実行
    test_results = asyncio.run(main())

    # 終了コード
    if test_results["success"] == test_results["total"]:
        print("\n🎉 全テスト成功！")
        sys.exit(0)
    else:
        print(f"\n⚠️ {test_results['error'] + test_results['exception']}件のテストが失敗しました")
        sys.exit(1)
