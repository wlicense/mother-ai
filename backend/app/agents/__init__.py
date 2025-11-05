from app.agents.base import AgentRegistry
from app.agents.phase_agents import (
    OrchestratorAgent,
    Phase1RequirementsAgent,
    Phase2CodeGenerationAgent,
    Phase3DeploymentAgent,
    Phase4SelfImprovementAgent,
)


def initialize_agents():
    """
    MVP用エージェントを登録
    """
    # オーケストレーター
    orchestrator = OrchestratorAgent()
    AgentRegistry.register("orchestrator", orchestrator)

    # Phase 1-4 エージェント
    phase1 = Phase1RequirementsAgent()
    AgentRegistry.register("phase1", phase1)

    phase2 = Phase2CodeGenerationAgent()
    AgentRegistry.register("phase2", phase2)

    phase3 = Phase3DeploymentAgent()
    AgentRegistry.register("phase3", phase3)

    phase4 = Phase4SelfImprovementAgent()
    AgentRegistry.register("phase4", phase4)

    print("✓ エージェントを初期化しました")
    print(f"  - 登録エージェント数: {len(AgentRegistry.get_all_agents())}")


__all__ = [
    "initialize_agents",
    "AgentRegistry",
    "OrchestratorAgent",
    "Phase1RequirementsAgent",
    "Phase2CodeGenerationAgent",
    "Phase3DeploymentAgent",
    "Phase4SelfImprovementAgent",
]
