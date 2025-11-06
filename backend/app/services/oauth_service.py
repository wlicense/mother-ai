"""
OAuth認証サービス

Google/GitHub OAuth 2.0認証を管理
"""
from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

# OAuth設定
oauth = OAuth()

# Google OAuth設定
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# GitHub OAuth設定
oauth.register(
    name='github',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    client_kwargs={
        'scope': 'user:email'
    }
)


def get_oauth_client():
    """OAuthクライアントを取得"""
    return oauth
