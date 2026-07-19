"""Provider-agnostic LLM abstraction.

Every concrete provider (OpenAI, Anthropic, Gemini, OpenRouter, Groq,
DeepSeek, Ollama) implements `LLMProvider` and yields `StreamChunk`s from
`stream_chat`. Nothing above this layer (agent, cli) knows which vendor
it's talking to.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import AsyncIterator, Optional


class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict


@dataclass
class Message:
    role: Role
    content: str
    tool_calls: list[ToolCall] = field(default_factory=list)
    tool_call_id: Optional[str] = None
    name: Optional[str] = None


@dataclass
class ToolSpec:
    """A tool definition exposed to the model, in provider-agnostic form."""

    name: str
    description: str
    parameters: dict  # JSON Schema


class ChunkType(str, Enum):
    TEXT = "text"
    TOOL_CALL = "tool_call"
    USAGE = "usage"
    DONE = "done"
    ERROR = "error"


@dataclass
class StreamChunk:
    type: ChunkType
    text: str = ""
    tool_call: Optional[ToolCall] = None
    input_tokens: int = 0
    output_tokens: int = 0
    error: Optional[str] = None


@dataclass
class ModelInfo:
    id: str
    context_window: int
    input_price_per_1m: float  # USD
    output_price_per_1m: float  # USD
    supports_vision: bool = False
    supports_tools: bool = True


class LLMProvider(ABC):
    """Abstract base every provider implementation must satisfy."""

    name: str = "base"
    default_model: str = ""

    def __init__(self, api_key: Optional[str], model: Optional[str] = None) -> None:
        self.api_key = api_key
        self.model = model or self.default_model

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[Message],
        tools: list[ToolSpec] | None = None,
        temperature: float = 0.3,
        top_p: float = 1.0,
        max_tokens: int = 4096,
    ) -> AsyncIterator[StreamChunk]:
        """Stream a chat completion. Must yield a final ChunkType.DONE chunk
        (with usage populated) or ChunkType.ERROR on failure."""
        raise NotImplementedError

    @abstractmethod
    def list_models(self) -> list[ModelInfo]:
        raise NotImplementedError

    def estimate_cost(self, model_id: str, input_tokens: int, output_tokens: int) -> float:
        for m in self.list_models():
            if m.id == model_id:
                return (
                    input_tokens / 1_000_000 * m.input_price_per_1m
                    + output_tokens / 1_000_000 * m.output_price_per_1m
                )
        return 0.0
