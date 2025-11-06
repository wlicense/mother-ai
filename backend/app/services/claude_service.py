"""
Claude API サービス

Claude APIとの通信を管理します。
"""
import os
from typing import AsyncGenerator, Optional
from anthropic import Anthropic, AsyncAnthropic
from app.core.config import settings
from app.utils.encryption import decrypt_api_key


class ClaudeService:
    """Claude API統合サービス"""

    def __init__(self):
        """初期化"""
        # 非同期クライアントを使用（SSE対応）
        self.client = AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = settings.CLAUDE_MODEL

    async def send_message_stream(
        self,
        messages: list[dict],
        system_prompt: str = "あなたは親切で有能なAIアシスタントです。",
        max_tokens: int = 4096,
        use_cache: bool = True,
        user_api_key: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        メッセージを送信してストリーミングで応答を取得

        Args:
            messages: メッセージ履歴 [{"role": "user", "content": "..."}]
            system_prompt: システムプロンプト
            max_tokens: 最大トークン数
            use_cache: プロンプトキャッシングを使用するか（デフォルト: True）
            user_api_key: ユーザー独自のAPIキー（暗号化済み、オプション）

        Yields:
            AIの応答テキスト（トークン単位）
        """
        try:
            # ユーザー独自のAPIキーがある場合は使用
            client = self.client
            if user_api_key:
                decrypted_key = decrypt_api_key(user_api_key)
                if decrypted_key:
                    client = AsyncAnthropic(api_key=decrypted_key)

            # プロンプトキャッシング対応
            # システムプロンプトをキャッシュブロックとして設定
            system_blocks = [
                {
                    "type": "text",
                    "text": system_prompt,
                }
            ]

            # キャッシュを有効にする場合、cache_controlを追加
            if use_cache and len(system_prompt) > 1024:  # 長いプロンプトのみキャッシュ
                system_blocks[0]["cache_control"] = {"type": "ephemeral"}

            # メッセージ履歴が長い場合、過去のメッセージもキャッシュ
            processed_messages = messages.copy()
            if use_cache and len(processed_messages) > 2:
                # 最後から2番目のメッセージにキャッシュマーカーを追加
                # （最新メッセージは変わるのでキャッシュしない）
                if len(processed_messages) >= 2:
                    processed_messages[-2]["cache_control"] = {"type": "ephemeral"}

            # Claude APIにストリーミングリクエスト
            async with client.messages.stream(
                model=self.model,
                max_tokens=max_tokens,
                system=system_blocks,
                messages=processed_messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield text

        except Exception as e:
            # エラーハンドリング
            error_message = f"Claude API エラー: {str(e)}"
            print(error_message)
            yield f"\n\n[エラー: {error_message}]"

    async def send_message(
        self,
        messages: list[dict],
        system_prompt: str = "あなたは親切で有能なAIアシスタントです。",
        max_tokens: int = 4096,
        user_api_key: Optional[str] = None,
    ) -> str:
        """
        メッセージを送信して完全な応答を取得（非ストリーミング）

        Args:
            messages: メッセージ履歴
            system_prompt: システムプロンプト
            max_tokens: 最大トークン数
            user_api_key: ユーザー独自のAPIキー（暗号化済み、オプション）

        Returns:
            AIの応答テキスト（完全版）
        """
        try:
            # ユーザー独自のAPIキーがある場合は使用
            client = self.client
            if user_api_key:
                decrypted_key = decrypt_api_key(user_api_key)
                if decrypted_key:
                    client = AsyncAnthropic(api_key=decrypted_key)

            response = await client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages,
            )

            # テキストコンテンツを抽出
            return response.content[0].text if response.content else ""

        except Exception as e:
            error_message = f"Claude API エラー: {str(e)}"
            print(error_message)
            return f"[エラー: {error_message}]"

    def get_usage_info(self, response) -> dict:
        """
        API使用量情報を取得

        Args:
            response: Claude APIレスポンス

        Returns:
            使用量情報（input_tokens, output_tokens等）
        """
        if hasattr(response, 'usage'):
            return {
                'input_tokens': response.usage.input_tokens,
                'output_tokens': response.usage.output_tokens,
                'model': self.model,
            }
        return {
            'input_tokens': 0,
            'output_tokens': 0,
            'model': self.model,
        }


# シングルトンインスタンス
_claude_service_instance = None


def get_claude_service() -> ClaudeService:
    """
    ClaudeServiceのシングルトンインスタンスを取得

    Returns:
        ClaudeServiceインスタンス
    """
    global _claude_service_instance
    if _claude_service_instance is None:
        _claude_service_instance = ClaudeService()
    return _claude_service_instance
