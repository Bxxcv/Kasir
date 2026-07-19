"""`myai doctor` — diagnoses environment: Python version, API keys present,
git availability, and actually pings each configured provider."""
from __future__ import annotations

import shutil
import sys

import httpx
from rich.console import Console
from rich.table import Table

from myai.config.settings import get_settings

console = Console()

_PING_URLS = {
    "openai": "https://api.openai.com/v1/models",
    "anthropic": "https://api.anthropic.com/v1/models",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai/models",
    "openrouter": "https://openrouter.ai/api/v1/models",
    "groq": "https://api.groq.com/openai/v1/models",
    "deepseek": "https://api.deepseek.com/v1/models",
}


def _check_key_present(settings, provider: str) -> bool:
    return bool(settings.key_for(provider))


def run_doctor() -> None:
    settings = get_settings()
    table = Table(title="myai doctor", border_style="cyan")
    table.add_column("Check")
    table.add_column("Status")

    table.add_row("Python version", f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    table.add_row("git binary", "found" if shutil.which("git") else "[red]not found[/red]")

    for provider in ("openai", "anthropic", "gemini", "openrouter", "groq", "deepseek"):
        has_key = _check_key_present(settings, provider)
        if not has_key:
            table.add_row(f"{provider} API key", "[yellow]not set[/yellow]")
            continue
        key = settings.key_for(provider)
        headers = {"Authorization": f"Bearer {key}"}
        if provider == "anthropic":
            headers = {"x-api-key": key, "anthropic-version": "2023-06-01"}
        try:
            resp = httpx.get(_PING_URLS[provider], headers=headers, timeout=8.0)
            if resp.status_code in (200, 401, 403):
                status = "[green]reachable[/green]" if resp.status_code == 200 else "[red]key invalid[/red]"
            else:
                status = f"[yellow]HTTP {resp.status_code}[/yellow]"
        except httpx.HTTPError as e:
            status = f"[red]connection failed: {e}[/red]"
        table.add_row(f"{provider} API key", status)

    table.add_row("ollama host", settings.ollama_host)

    console.print(table)
