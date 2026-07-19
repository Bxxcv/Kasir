"""`myai config` — view and edit persisted settings in ~/.myai/config.yaml."""
from __future__ import annotations

from rich.console import Console
from rich.table import Table

from myai.config.settings import get_yaml_config

console = Console()


def show_config() -> None:
    cfg = get_yaml_config()
    table = Table(title="myai config", border_style="cyan")
    table.add_column("Key", style="bold")
    table.add_column("Value")
    for k, v in cfg.data.items():
        table.add_row(k, str(v))
    console.print(table)
    console.print(f"[dim]File: {cfg.path}[/dim]")


def set_config(key: str, value: str) -> None:
    cfg = get_yaml_config()
    # Best-effort type coercion so numeric settings stay numeric in the YAML.
    parsed: object = value
    if value.lower() in ("true", "false"):
        parsed = value.lower() == "true"
    else:
        try:
            parsed = int(value)
        except ValueError:
            try:
                parsed = float(value)
            except ValueError:
                parsed = value
    cfg.set(key, parsed)
    console.print(f"[green]OK[/green] {key} = {parsed}")
