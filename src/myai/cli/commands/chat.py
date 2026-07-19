"""`myai chat` — interactive streaming chat with the configured LLM provider.

This is a real, working REPL: it calls the actual provider API, streams
tokens live into a Rich panel, tracks usage/cost, and persists history to
SQLite. No mocked responses.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from rich.console import Console, Group
from rich.live import Live
from rich.markdown import Markdown
from rich.panel import Panel
from rich.text import Text

from myai.config.settings import get_settings, get_yaml_config
from myai.core.exceptions import MissingAPIKeyError, ProviderError
from myai.core.project_scanner import scan_project
from myai.core.usage import UsageTracker
from myai.llm.base import ChunkType, Message, Role
from myai.llm.factory import create_provider
from myai.history.store import HistoryStore

console = Console()

SYSTEM_PROMPT_TEMPLATE = """Kamu adalah myai, AI coding assistant yang berjalan di terminal pengguna.
Working directory: {cwd}
Git branch: {branch}
Project markers terdeteksi: {markers}

Struktur project (preview):
{tree}

Jawab secara ringkas, akurat, dan gunakan code block dengan bahasa yang sesuai saat menampilkan kode."""


def _build_system_message() -> Message:
    ctx = scan_project()
    content = SYSTEM_PROMPT_TEMPLATE.format(
        cwd=str(ctx.root),
        branch=ctx.git_branch or "(bukan git repo)",
        markers=", ".join(ctx.markers_found) or "(tidak ada)",
        tree=ctx.file_tree_preview or "(kosong)",
    )
    return Message(role=Role.SYSTEM, content=content)


def _status_bar(provider: str, model: str, usage: UsageTracker) -> Text:
    cwd = Path.cwd().name
    t = Text()
    t.append(f" {provider}", style="bold cyan")
    t.append(f" · {model}", style="dim")
    t.append(f"  │  {cwd}", style="dim")
    t.append(f"  │  tokens: {usage.total_tokens}", style="dim")
    t.append(f"  │  cost: ${usage.cost_usd:.4f}", style="dim")
    return t


async def _run_turn(
    provider_obj,
    messages: list[Message],
    usage: UsageTracker,
    temperature: float,
    top_p: float,
    max_tokens: int,
) -> str:
    accumulated = ""
    with Live(console=console, refresh_per_second=12, vertical_overflow="visible") as live:
        async for chunk in provider_obj.stream_chat(
            messages, temperature=temperature, top_p=top_p, max_tokens=max_tokens
        ):
            if chunk.type == ChunkType.TEXT:
                accumulated += chunk.text
                live.update(
                    Panel(Markdown(accumulated or " "), title="myai", border_style="cyan")
                )
            elif chunk.type == ChunkType.DONE:
                turn_cost = provider_obj.estimate_cost(
                    provider_obj.model, chunk.input_tokens, chunk.output_tokens
                )
                usage.add(chunk.input_tokens, chunk.output_tokens, turn_cost)
            elif chunk.type == ChunkType.ERROR:
                live.update(
                    Panel(Text(chunk.error or "Unknown error", style="bold red"), title="Error", border_style="red")
                )
                return accumulated
    return accumulated


def run_chat(provider_name: str | None, model: str | None) -> None:
    settings = get_settings()
    yaml_cfg = get_yaml_config()

    provider_name = provider_name or yaml_cfg.get("provider", "anthropic")
    model = model or yaml_cfg.get("model")
    temperature = float(yaml_cfg.get("temperature", 0.3))
    top_p = float(yaml_cfg.get("top_p", 1.0))
    max_tokens = int(yaml_cfg.get("max_tokens", 4096))

    try:
        provider_obj = create_provider(provider_name, model=model, settings=settings)
    except MissingAPIKeyError as e:
        console.print(Panel(str(e), title="Config Error", border_style="red"))
        return
    except ValueError as e:
        console.print(Panel(str(e), title="Config Error", border_style="red"))
        return

    usage = UsageTracker(provider=provider_name, model=provider_obj.model)
    history = HistoryStore()
    session_id = history.start_session(provider_name, provider_obj.model)

    messages: list[Message] = [_build_system_message()]

    console.print(
        Panel(
            Text.from_markup(
                "[bold]myai[/bold] — AI coding agent\n"
                "Ketik pesan lalu Enter. [dim]Ctrl+C[/dim] untuk keluar, "
                "[dim]/reset[/dim] untuk sesi baru, [dim]/exit[/dim] untuk keluar."
            ),
            border_style="cyan",
        )
    )

    while True:
        console.print(_status_bar(provider_name, provider_obj.model, usage))
        try:
            user_input = console.input("[bold green]>[/bold green] ")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Sesi berakhir.[/dim]")
            break

        if not user_input.strip():
            continue
        if user_input.strip() in ("/exit", "/quit"):
            break
        if user_input.strip() == "/reset":
            messages = [_build_system_message()]
            session_id = history.start_session(provider_name, provider_obj.model)
            console.print("[dim]Sesi direset.[/dim]")
            continue

        messages.append(Message(role=Role.USER, content=user_input))
        history.append_message(session_id, "user", user_input)

        reply = asyncio.run(
            _run_turn(provider_obj, messages, usage, temperature, top_p, max_tokens)
        )
        messages.append(Message(role=Role.ASSISTANT, content=reply))
        history.append_message(session_id, "assistant", reply)
