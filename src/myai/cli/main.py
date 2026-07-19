"""myai — AI Coding Agent CLI. Entry point wiring."""
from __future__ import annotations

from typing import Optional

import typer
from rich.console import Console

from myai.cli.commands.chat import run_chat
from myai.cli.commands.config_cmd import set_config, show_config
from myai.cli.commands.doctor import run_doctor
from myai.config.settings import ensure_dirs

app = typer.Typer(
    name="myai",
    help="AI Coding Agent CLI — jalan lokal, bawa API key sendiri.",
    no_args_is_help=False,
    add_completion=True,
)
console = Console()


@app.callback(invoke_without_command=True)
def main(ctx: typer.Context) -> None:
    ensure_dirs()
    if ctx.invoked_subcommand is None:
        # `myai` with no subcommand behaves like `myai chat`.
        run_chat(provider_name=None, model=None)


@app.command()
def chat(
    provider: Optional[str] = typer.Option(None, "--provider", "-p", help="openai|anthropic|gemini|openrouter|groq|deepseek|ollama"),
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Model id override"),
) -> None:
    """Mulai sesi chat interaktif dengan streaming."""
    run_chat(provider_name=provider, model=model)


@app.command()
def doctor() -> None:
    """Diagnosa environment: Python, git, dan konektivitas tiap provider."""
    run_doctor()


config_app = typer.Typer(help="Lihat/ubah konfigurasi ~/.myai/config.yaml")
app.add_typer(config_app, name="config")


@config_app.command("show")
def config_show() -> None:
    show_config()


@config_app.command("set")
def config_set(key: str, value: str) -> None:
    set_config(key, value)


def entrypoint() -> None:
    app()


if __name__ == "__main__":
    entrypoint()
