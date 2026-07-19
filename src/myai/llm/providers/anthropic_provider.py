"""Real Anthropic Messages API client with SSE streaming.

No SDK dependency — implemented directly on httpx so the abstraction stays
uniform across all providers and the request/response mapping is explicit.
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

API_URL = "https://api.anthropic.com/v1/messages"
API_VERSION = "2023-06-01"


class AnthropicProvider(LLMProvider):
    name = "anthropic"
    default_model = "claude-sonnet-4-6"

    _MODELS = [
        ModelInfo("claude-opus-4-8", 200_000, 15.0, 75.0, supports_vision=True),
        ModelInfo("claude-sonnet-5", 200_000, 3.0, 15.0, supports_vision=True),
        ModelInfo("claude-sonnet-4-6", 200_000, 3.0, 15.0, supports_vision=True),
        ModelInfo("claude-haiku-4-5-20251001", 200_000, 0.8, 4.0, supports_vision=True),
    ]

    def list_models(self) -> list[ModelInfo]:
        return self._MODELS

    @staticmethod
    def _to_anthropic_messages(messages: list[Message]) -> tuple[Optional[str], list[dict]]:
        system_parts: list[str] = []
        out: list[dict] = []
        for m in messages:
            if m.role == Role.SYSTEM:
                system_parts.append(m.content)
                continue
            if m.role == Role.TOOL:
                out.append(
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": m.tool_call_id,
                                "content": m.content,
                            }
                        ],
                    }
                )
                continue
            if m.role == Role.ASSISTANT and m.tool_calls:
                content: list[dict] = []
                if m.content:
                    content.append({"type": "text", "text": m.content})
                for tc in m.tool_calls:
                    content.append(
                        {
                            "type": "tool_use",
                            "id": tc.id,
                            "name": tc.name,
                            "input": tc.arguments,
                        }
                    )
                out.append({"role": "assistant", "content": content})
                continue
            out.append({"role": m.role.value, "content": m.content})
        system = "\n\n".join(system_parts) if system_parts else None
        return system, out

    @staticmethod
    def _to_anthropic_tools(tools: list[ToolSpec] | None) -> list[dict] | None:
        if not tools:
            return None
        return [
            {"name": t.name, "description": t.description, "input_schema": t.parameters}
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
            yield StreamChunk(type=ChunkType.ERROR, error="Anthropic API key tidak diset.")
            return

        system, anth_messages = self._to_anthropic_messages(messages)
        payload: dict = {
            "model": self.model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "messages": anth_messages,
            "stream": True,
        }
        if system:
            payload["system"] = system
        anth_tools = self._to_anthropic_tools(tools)
        if anth_tools:
            payload["tools"] = anth_tools

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": API_VERSION,
            "content-type": "application/json",
        }

        # tool_use blocks arrive as incremental JSON deltas; accumulate per index.
        pending_tool: dict[int, dict] = {}
        input_tokens = 0
        output_tokens = 0

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST", API_URL, headers=headers, json=payload
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
                        if not data_str:
                            continue
                        event = json.loads(data_str)
                        etype = event.get("type")

                        if etype == "message_start":
                            usage = event.get("message", {}).get("usage", {})
                            input_tokens = usage.get("input_tokens", 0)

                        elif etype == "content_block_start":
                            block = event.get("content_block", {})
                            if block.get("type") == "tool_use":
                                idx = event["index"]
                                pending_tool[idx] = {
                                    "id": block.get("id"),
                                    "name": block.get("name"),
                                    "partial_json": "",
                                }

                        elif etype == "content_block_delta":
                            delta = event.get("delta", {})
                            idx = event.get("index")
                            if delta.get("type") == "text_delta":
                                yield StreamChunk(type=ChunkType.TEXT, text=delta.get("text", ""))
                            elif delta.get("type") == "input_json_delta" and idx in pending_tool:
                                pending_tool[idx]["partial_json"] += delta.get("partial_json", "")

                        elif etype == "content_block_stop":
                            idx = event.get("index")
                            if idx in pending_tool:
                                tool = pending_tool.pop(idx)
                                try:
                                    args = json.loads(tool["partial_json"] or "{}")
                                except json.JSONDecodeError:
                                    args = {}
                                yield StreamChunk(
                                    type=ChunkType.TOOL_CALL,
                                    tool_call=ToolCall(
                                        id=tool["id"], name=tool["name"], arguments=args
                                    ),
                                )

                        elif etype == "message_delta":
                            usage = event.get("usage", {})
                            output_tokens = usage.get("output_tokens", output_tokens)

                        elif etype == "message_stop":
                            yield StreamChunk(
                                type=ChunkType.DONE,
                                input_tokens=input_tokens,
                                output_tokens=output_tokens,
                            )

        except ProviderError as e:
            yield StreamChunk(type=ChunkType.ERROR, error=str(e))
        except httpx.HTTPError as e:
            yield StreamChunk(type=ChunkType.ERROR, error=f"Koneksi ke Anthropic gagal: {e}")
