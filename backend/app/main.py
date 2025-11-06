from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api import auth, projects, admin, agents, users
from app.agents import initialize_agents


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 マザーAI起動中...")
    initialize_agents()
    print("✓ マザーAI起動完了")
    yield
    # Shutdown
    print("🛑 マザーAIシャットダウン")


app = FastAPI(
    title="マザーAI API",
    description="AI駆動開発プラットフォーム",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(auth.router, prefix="/api/v1/auth", tags=["認証"])
app.include_router(users.router, prefix="/api/v1/users", tags=["ユーザー"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["プロジェクト"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["エージェント"])


@app.get("/")
async def root():
    return {
        "message": "マザーAI API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
    )
