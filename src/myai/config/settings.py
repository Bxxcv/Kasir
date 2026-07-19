"""Application configuration.

Loads settings from environment variables / .env file and an optional
config.yaml for user-tunable defaults (theme, temperature, etc).
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal, Optional

import yaml
from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ProviderName = Literal[
    "openai", "anthropic", "gemini", "openrouter", "groq", "deepseek", "ollama"
]

CONFIG_DIR = Path.home() / ".myai"
CONFIG_FILE = CONFIG_DIR / "config.yaml"
DB_PATH = CONFIG_DIR / "myai.db"
LOG_DIR = CONFIG_DIR / "logs"
CACHE_DIR = CONFIG_DIR / "cache"


class YamlConfig:
    """Loads the user-tunable, non-secret config.yaml (theme, provider, etc)."""

    _DEFAULTS = {
        "provider": "anthropic",
        "model": None,
        "theme": "dark",
        "temperature": 0.3,
        "top_p": 1.0,
        "max_tokens": 4096,
        "auto_approve_safe_commands": True,
    }

    def __init__(self, path: Path = CONFIG_FILE) -> None:
        self.path = path
        self._data: dict = dict(self._DEFAULTS)
        if path.exists():
            try:
                loaded = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
                self._data.update(loaded)
            except yaml.YAMLError:
                # Corrupt config.yaml must never crash the CLI; fall back to defaults.
                pass

    def get(self, key: str, default=None):
        return self._data.get(key, default)

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(yaml.safe_dump(self._data, sort_keys=False), encoding="utf-8")

    def set(self, key: str, value) -> None:
        self._data[key] = value
        self.save()

    @property
    def data(self) -> dict:
        return dict(self._data)


class Settings(BaseSettings):
    """Secrets and environment-derived settings. Read from .env / real env vars."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    openai_api_key: Optional[SecretStr] = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: Optional[SecretStr] = Field(default=None, alias="ANTHROPIC_API_KEY")
    gemini_api_key: Optional[SecretStr] = Field(default=None, alias="GEMINI_API_KEY")
    openrouter_api_key: Optional[SecretStr] = Field(default=None, alias="OPENROUTER_API_KEY")
    groq_api_key: Optional[SecretStr] = Field(default=None, alias="GROQ_API_KEY")
    deepseek_api_key: Optional[SecretStr] = Field(default=None, alias="DEEPSEEK_API_KEY")
    ollama_host: str = Field(default="http://localhost:11434", alias="OLLAMA_HOST")

    def key_for(self, provider: ProviderName) -> Optional[str]:
        mapping = {
            "openai": self.openai_api_key,
            "anthropic": self.anthropic_api_key,
            "gemini": self.gemini_api_key,
            "openrouter": self.openrouter_api_key,
            "groq": self.groq_api_key,
            "deepseek": self.deepseek_api_key,
        }
        secret = mapping.get(provider)
        return secret.get_secret_value() if secret else None


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_yaml_config() -> YamlConfig:
    return YamlConfig()


def ensure_dirs() -> None:
    for d in (CONFIG_DIR, LOG_DIR, CACHE_DIR):
        d.mkdir(parents=True, exist_ok=True)
