"""
APIキー暗号化ユーティリティ

Fernetを使用した対称鍵暗号化を実装
"""
from cryptography.fernet import Fernet
from app.core.config import settings


def encrypt_api_key(api_key: str) -> str:
    """
    APIキーを暗号化

    Args:
        api_key: 平文のAPIキー

    Returns:
        暗号化されたAPIキー（Base64エンコード済み）
    """
    if not api_key:
        return ""

    f = Fernet(settings.ENCRYPTION_KEY.encode())
    return f.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """
    暗号化されたAPIキーを復号化

    Args:
        encrypted_key: 暗号化されたAPIキー

    Returns:
        平文のAPIキー
    """
    if not encrypted_key:
        return ""

    try:
        f = Fernet(settings.ENCRYPTION_KEY.encode())
        return f.decrypt(encrypted_key.encode()).decode()
    except Exception as e:
        # 暗号化キーが変更された場合や不正なデータの場合
        print(f"復号化エラー: {str(e)}")
        return ""
