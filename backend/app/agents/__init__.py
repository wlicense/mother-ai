from app.agents.base import AgentRegistry
from app.agents.phase_agents import (
    OrchestratorAgent,
    Phase1RequirementsAgent,
    Phase2CodeGenerationAgent,
    Phase3DeploymentAgent,
    Phase4SelfImprovementAgent,
)
from app.agents.extended_phase_agents import (
    Phase5TestGenerationAgent,
    Phase6DocumentationAgent,
    Phase7DebugAgent,
    Phase8PerformanceAgent,
    Phase9SecurityAgent,
    Phase10DatabaseAgent,
    Phase11APIDesignAgent,
    Phase12UXAgent,
    Phase13RefactoringAgent,
    Phase14MonitoringAgent,
)


def initialize_agents():
    """
    全エージェントを登録（Phase 1-14）
    """
    # オーケストレーター
    orchestrator = OrchestratorAgent()
    AgentRegistry.register("orchestrator", orchestrator)

    # Phase 1-4 エージェント（MVP）
    phase1 = Phase1RequirementsAgent()
    AgentRegistry.register("phase1", phase1)

    phase2 = Phase2CodeGenerationAgent()
    AgentRegistry.register("phase2", phase2)

    phase3 = Phase3DeploymentAgent()
    AgentRegistry.register("phase3", phase3)

    phase4 = Phase4SelfImprovementAgent()
    AgentRegistry.register("phase4", phase4)

    # Phase 5-14 エージェント（拡張機能）
    phase5 = Phase5TestGenerationAgent()
    AgentRegistry.register("phase5", phase5)

    phase6 = Phase6DocumentationAgent()
    AgentRegistry.register("phase6", phase6)

    phase7 = Phase7DebugAgent()
    AgentRegistry.register("phase7", phase7)

    phase8 = Phase8PerformanceAgent()
    AgentRegistry.register("phase8", phase8)

    phase9 = Phase9SecurityAgent()
    AgentRegistry.register("phase9", phase9)

    phase10 = Phase10DatabaseAgent()
    AgentRegistry.register("phase10", phase10)

    phase11 = Phase11APIDesignAgent()
    AgentRegistry.register("phase11", phase11)

    phase12 = Phase12UXAgent()
    AgentRegistry.register("phase12", phase12)

    phase13 = Phase13RefactoringAgent()
    AgentRegistry.register("phase13", phase13)

    phase14 = Phase14MonitoringAgent()
    AgentRegistry.register("phase14", phase14)

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
