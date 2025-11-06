from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "マザーAI"
    DEBUG: bool = True
    PORT: int = 8572

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3347", "http://127.0.0.1:3347"]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5434/mother_ai"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Claude API
    CLAUDE_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20250929"

    # Email (for notifications)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@mother-ai.example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Encryption (for API keys)
    ENCRYPTION_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # 未定義のフィールドを無視


settings = Settings()
