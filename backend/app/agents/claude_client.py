"""
Anthropic Claude API クライアント
プロンプトキャッシングを活用してコストを削減
"""
import os
from typing import Dict, Any, List, Optional
from anthropic import Anthropic
import json


class ClaudeClient:
    """
    Anthropic Claude API のラッパークラス
    プロンプトキャッシング、ストリーミング、エラーハンドリングを提供
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Claude APIクライアントを初期化

        Args:
            api_key: AnthropicのAPIキー（Noneの場合は環境変数またはconfigから取得）
        """
        # APIキーの取得優先順位: 引数 > 環境変数(ANTHROPIC_API_KEY) > config(CLAUDE_API_KEY)
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
        if not self.api_key:
            try:
                from app.core.config import settings
                self.api_key = settings.CLAUDE_API_KEY
            except:
                pass

        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY が設定されていません")

        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-20250514"  # 最新のSonnet 4モデル

    async def generate_text(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Claude APIを使用してテキストを生成

        Args:
            messages: 会話履歴（[{"role": "user", "content": "..."}]形式）
            system_prompt: システムプロンプト（エージェントの役割定義）
            max_tokens: 最大生成トークン数
            temperature: 生成の多様性（0.0-1.0）
            use_cache: プロンプトキャッシングを使用するか

        Returns:
            {
                "content": "生成されたテキスト",
                "usage": {
                    "input_tokens": 100,
                    "output_tokens": 200,
                    "cache_creation_input_tokens": 0,
                    "cache_read_input_tokens": 0
                },
                "model": "claude-sonnet-4-20250514"
            }
        """
        try:
            # プロンプトキャッシングを使用する場合、system promptを cache_control で指定
            system_blocks = []
            if system_prompt and use_cache:
                system_blocks = [
                    {
                        "type": "text",
                        "text": system_prompt,
                        "cache_control": {"type": "ephemeral"}  # 5分間キャッシュ
                    }
                ]
            elif system_prompt:
                system_blocks = [{"type": "text", "text": system_prompt}]

            # API呼び出し
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_blocks if system_blocks else None,
                messages=messages
            )

            # レスポンスを整形
            return {
                "content": response.content[0].text,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
                    "cache_read_input_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
                },
                "model": response.model,
                "stop_reason": response.stop_reason,
            }

        except Exception as e:
            # エラーハンドリング
            return {
                "error": str(e),
                "content": None,
                "usage": None
            }

    async def generate_with_tools(
        self,
        messages: List[Dict[str, str]],
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
    ) -> Dict[str, Any]:
        """
        Function Calling（Tools）を使用してテキストを生成

        Args:
            messages: 会話履歴
            tools: 利用可能なツール定義
            system_prompt: システムプロンプト
            max_tokens: 最大生成トークン数

        Returns:
            {
                "content": "生成されたテキスト",
                "tool_calls": [...],  # ツール呼び出しがある場合
                "usage": {...}
            }
        """
        try:
            system_blocks = []
            if system_prompt:
                system_blocks = [
                    {
                        "type": "text",
                        "text": system_prompt,
                        "cache_control": {"type": "ephemeral"}
                    }
                ]

            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_blocks if system_blocks else None,
                messages=messages,
                tools=tools
            )

            # ツール呼び出しの抽出
            tool_calls = []
            text_content = ""

            for content_block in response.content:
                if content_block.type == "text":
                    text_content += content_block.text
                elif content_block.type == "tool_use":
                    tool_calls.append({
                        "id": content_block.id,
                        "name": content_block.name,
                        "input": content_block.input
                    })

            return {
                "content": text_content,
                "tool_calls": tool_calls,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
                    "cache_read_input_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
                },
                "model": response.model,
            }

        except Exception as e:
            return {
                "error": str(e),
                "content": None,
                "tool_calls": [],
                "usage": None
            }

    def estimate_cost(self, usage: Dict[str, int]) -> Dict[str, float]:
        """
        API使用量からコストを推定

        Args:
            usage: API使用量（input_tokens, output_tokensなど）

        Returns:
            {
                "input_cost": 0.003,  # USD
                "output_cost": 0.015,
                "cache_write_cost": 0.00375,
                "cache_read_cost": 0.0003,
                "total_cost": 0.01905
            }
        """
        # Sonnet 4.5の料金（2025年1月時点）
        # $3/MTok (input), $15/MTok (output)
        # キャッシュ書き込み: 1.25x, キャッシュ読み取り: 0.1x

        input_tokens = usage.get("input_tokens", 0)
        output_tokens = usage.get("output_tokens", 0)
        cache_creation = usage.get("cache_creation_input_tokens", 0)
        cache_read = usage.get("cache_read_input_tokens", 0)

        input_cost = (input_tokens / 1_000_000) * 3.0
        output_cost = (output_tokens / 1_000_000) * 15.0
        cache_write_cost = (cache_creation / 1_000_000) * 3.0 * 1.25
        cache_read_cost = (cache_read / 1_000_000) * 3.0 * 0.1

        total_cost = input_cost + output_cost + cache_write_cost + cache_read_cost

        return {
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "cache_write_cost": round(cache_write_cost, 6),
            "cache_read_cost": round(cache_read_cost, 6),
            "total_cost": round(total_cost, 6),
            "currency": "USD"
        }


# シングルトンインスタンス
_claude_client: Optional[ClaudeClient] = None


def get_claude_client() -> ClaudeClient:
    """
    ClaudeClientのシングルトンインスタンスを取得
    """
    global _claude_client
    if _claude_client is None:
        _claude_client = ClaudeClient()
    return _claude_client
