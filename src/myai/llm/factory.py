"""Selects and instantiates the concrete LLMProvider for a given provider name."""
from __future__ import annotations

from typing import Optional

from myai.config.settings import ProviderName, Settings, get_settings
from myai.core.exceptions import MissingAPIKeyError
from myai.llm.base import LLMProvider
from myai.llm.providers.anthropic_provider import AnthropicProvider
from myai.llm.providers.openai_compatible import (
    DeepSeekProvider,
    GeminiProvider,
    GroqProvider,
    OllamaProvider,
    OpenAIProvider,
    OpenRouterProvider,
)

_REGISTRY: dict[ProviderName, type[LLMProvider]] = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
    "openrouter": OpenRouterProvider,
    "groq": GroqProvider,
    "deepseek": DeepSeekProvider,
    "ollama": OllamaProvider,
}


def create_provider(
    provider: ProviderName,
    model: Optional[str] = None,
    settings: Optional[Settings] = None,
) -> LLMProvider:
    settings = settings or get_settings()
    if provider not in _REGISTRY:
        raise ValueError(
            f"Provider tidak dikenal: {provider}. Pilihan: {', '.join(_REGISTRY)}"
        )
    cls = _REGISTRY[provider]
    if provider == "ollama":
        return OllamaProvider(api_key=None, model=model, host=settings.ollama_host)

    key = settings.key_for(provider)
    if not key:
        raise MissingAPIKeyError(provider)
    return cls(api_key=key, model=model)
