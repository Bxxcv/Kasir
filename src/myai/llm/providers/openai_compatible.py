"""OpenAI Chat Completions-compatible streaming client.

OpenAI, Groq, DeepSeek and OpenRouter all speak (close enough to) the same
`/chat/completions` SSE protocol, so one implementation is parameterized by
base_url + model catalogue rather than duplicated four times.
"""
from __future__ import annotations

import json
from typing import AsyncIterator, Optional

import httpx

from myai.core.exceptions import ProviderError
from myai.llm.base import (
    ChunkType,
    LLMProvider,
    Message,
    ModelInfo,
    Role,
    StreamChunk,
    ToolCall,
    ToolSpec,
)


class OpenAICompatibleProvider(LLMProvider):
    """Base for any OpenAI Chat Completions-compatible vendor."""

    base_url: str = "https://api.openai.com/v1"
    _MODELS: list[ModelInfo] = []

    def list_models(self) -> list[ModelInfo]:
        return self._MODELS

    @staticmethod
    def _to_openai_messages(messages: list[Message]) -> list[dict]:
        out: list[dict] = []
        for m in messages:
            if m.role == Role.TOOL:
                out.append(
                    {"role": "tool", "tool_call_id": m.tool_call_id, "content": m.content}
                )
                continue
            entry: dict = {"role": m.role.value, "content": m.content}
            if m.tool_calls:
                entry["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.name, "arguments": json.dumps(tc.arguments)},
                    }
                    for tc in m.tool_calls
                ]
            out.append(entry)
        return out

    @staticmethod
    def _to_openai_tools(tools: list[ToolSpec] | None) -> list[dict] | None:
        if not tools:
            return None
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                },
            }
            for t in tools
        ]

    async def stream_chat(
        self,
        messages: list[Message],
        tools: list[ToolSpec] | None = None,
        temperature: float = 0.3,
        top_p: float = 1.0,
        max_tokens: int = 4096,
    ) -> AsyncIterator[StreamChunk]:
        if not self.api_key:
            yield StreamChunk(type=ChunkType.ERROR, error=f"{self.name} API key tidak diset.")
            return

        payload: dict = {
            "model": self.model,
            "messages": self._to_openai_messages(messages),
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens,
            "stream": True,
            "stream_options": {"include_usage": True},
        }
        oai_tools = self._to_openai_tools(tools)
        if oai_tools:
            payload["tools"] = oai_tools

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # tool_calls stream as index-addressed argument fragments; accumulate.
        tool_acc: dict[int, dict] = {}
        input_tokens = 0
        output_tokens = 0

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST", f"{self.base_url}/chat/completions", headers=headers, json=payload
                ) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        raise ProviderError(
                            self.name, body.decode(errors="replace"), response.status_code
                        )
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data:"):
                            continue
                        data_str = line[len("data:"):].strip()
                        if data_str == "[DONE]":
                            for idx in sorted(tool_acc):
                                t = tool_acc[idx]
                                try:
                                    args = json.loads(t["arguments"] or "{}")
                                except json.JSONDecodeError:
                                    args = {}
                                yield StreamChunk(
                                    type=ChunkType.TOOL_CALL,
                                    tool_call=ToolCall(id=t["id"], name=t["name"], arguments=args),
                                )
                            yield StreamChunk(
                                type=ChunkType.DONE,
                                input_tokens=input_tokens,
                                output_tokens=output_tokens,
                            )
                            continue
                        if not data_str:
                            continue
                        event = json.loads(data_str)

                        usage = event.get("usage")
                        if usage:
                            input_tokens = usage.get("prompt_tokens", input_tokens)
                            output_tokens = usage.get("completion_tokens", output_tokens)

                        choices = event.get("choices") or []
                        if not choices:
                            continue
                        delta = choices[0].get("delta", {})

                        if delta.get("content"):
                            yield StreamChunk(type=ChunkType.TEXT, text=delta["content"])

                        for tc_delta in delta.get("tool_calls", []) or []:
                            idx = tc_delta.get("index", 0)
                            acc = tool_acc.setdefault(
                                idx, {"id": None, "name": None, "arguments": ""}
                            )
                            if tc_delta.get("id"):
                                acc["id"] = tc_delta["id"]
                            fn = tc_delta.get("function", {})
                            if fn.get("name"):
                                acc["name"] = fn["name"]
                            if fn.get("arguments"):
                                acc["arguments"] += fn["arguments"]

        except ProviderError as e:
            yield StreamChunk(type=ChunkType.ERROR, error=str(e))
        except httpx.HTTPError as e:
            yield StreamChunk(type=ChunkType.ERROR, error=f"Koneksi ke {self.name} gagal: {e}")


class OpenAIProvider(OpenAICompatibleProvider):
    name = "openai"
    base_url = "https://api.openai.com/v1"
    default_model = "gpt-4.1"
    _MODELS = [
        ModelInfo("gpt-4.1", 1_047_576, 2.0, 8.0, supports_vision=True),
        ModelInfo("gpt-4.1-mini", 1_047_576, 0.4, 1.6, supports_vision=True),
        ModelInfo("o4-mini", 200_000, 1.1, 4.4, supports_vision=True),
    ]


class GroqProvider(OpenAICompatibleProvider):
    name = "groq"
    base_url = "https://api.groq.com/openai/v1"
    default_model = "llama-3.3-70b-versatile"
    _MODELS = [
        ModelInfo("llama-3.3-70b-versatile", 128_000, 0.59, 0.79),
        ModelInfo("mixtral-8x7b-32768", 32_768, 0.24, 0.24),
    ]


class DeepSeekProvider(OpenAICompatibleProvider):
    name = "deepseek"
    base_url = "https://api.deepseek.com/v1"
    default_model = "deepseek-chat"
    _MODELS = [
        ModelInfo("deepseek-chat", 64_000, 0.27, 1.10),
        ModelInfo("deepseek-reasoner", 64_000, 0.55, 2.19),
    ]


class OpenRouterProvider(OpenAICompatibleProvider):
    name = "openrouter"
    base_url = "https://openrouter.ai/api/v1"
    default_model = "anthropic/claude-sonnet-4.5"
    _MODELS = [
        ModelInfo("anthropic/claude-sonnet-4.5", 200_000, 3.0, 15.0, supports_vision=True),
        ModelInfo("openai/gpt-4.1", 1_047_576, 2.0, 8.0, supports_vision=True),
        ModelInfo("meta-llama/llama-3.3-70b-instruct", 128_000, 0.35, 0.4),
    ]


class GeminiProvider(OpenAICompatibleProvider):
    """Google Gemini via its OpenAI-compatibility endpoint."""

    name = "gemini"
    base_url = "https://generativelanguage.googleapis.com/v1beta/openai"
    default_model = "gemini-2.5-flash"
    _MODELS = [
        ModelInfo("gemini-2.5-pro", 1_048_576, 1.25, 10.0, supports_vision=True),
        ModelInfo("gemini-2.5-flash", 1_048_576, 0.3, 2.5, supports_vision=True),
    ]


class OllamaProvider(OpenAICompatibleProvider):
    """Local Ollama server, exposed via its OpenAI-compatible endpoint. No API key required."""

    name = "ollama"
    default_model = "llama3.1"
    _MODELS = [
        ModelInfo("llama3.1", 128_000, 0.0, 0.0),
        ModelInfo("qwen2.5-coder", 32_768, 0.0, 0.0),
        ModelInfo("deepseek-coder-v2", 128_000, 0.0, 0.0),
    ]

    def __init__(self, api_key: Optional[str], model: Optional[str] = None, host: str = "http://localhost:11434") -> None:
        super().__init__(api_key or "ollama", model)
        self.base_url = f"{host.rstrip('/')}/v1"
