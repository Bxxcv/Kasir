"""Central exception hierarchy. All layers raise these instead of bare Exception,
so the CLI boundary can render clean, non-crashy error messages."""


class MyAIError(Exception):
    """Base class for all application errors."""


class ConfigError(MyAIError):
    """Raised for invalid or missing configuration."""


class ProviderError(MyAIError):
    """Raised when an LLM provider call fails."""

    def __init__(self, provider: str, message: str, status_code: int | None = None) -> None:
        self.provider = provider
        self.status_code = status_code
        super().__init__(f"[{provider}] {message}")


class MissingAPIKeyError(ConfigError):
    def __init__(self, provider: str) -> None:
        self.provider = provider
        super().__init__(
            f"API key untuk provider '{provider}' tidak ditemukan. "
            f"Set di file .env, contoh: {provider.upper()}_API_KEY=sk-..."
        )


class ToolError(MyAIError):
    """Raised when a filesystem/git/terminal tool fails."""


class DangerousOperationBlocked(ToolError):
    """Raised when a destructive/dangerous operation is blocked pending approval."""


class SessionError(MyAIError):
    """Raised for session/history persistence failures."""
