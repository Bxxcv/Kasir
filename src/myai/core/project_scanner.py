"""Scans the current working directory for project markers so the agent has
real, grounded context instead of hallucinating about the project."""
from __future__ import annotations

import subprocess
from dataclasses import dataclass, field
from pathlib import Path

MARKERS = [
    ".git",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
    "pubspec.yaml",
    "composer.json",
    "Gemfile",
    "README.md",
]

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
    ".next", ".mypy_cache", ".pytest_cache", "target", ".idea", ".vscode",
}


@dataclass
class ProjectContext:
    root: Path
    markers_found: list[str] = field(default_factory=list)
    git_branch: str | None = None
    is_git_repo: bool = False
    file_tree_preview: str = ""


def _git_branch(root: Path) -> str | None:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), "branch", "--show-current"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if result.returncode == 0:
            return result.stdout.strip() or None
    except (OSError, subprocess.SubprocessError):
        pass
    return None


def _build_tree(root: Path, max_depth: int = 2, max_entries: int = 200) -> str:
    lines: list[str] = []
    count = 0

    def walk(dir_path: Path, depth: int, prefix: str) -> None:
        nonlocal count
        if depth > max_depth or count >= max_entries:
            return
        try:
            entries = sorted(
                dir_path.iterdir(), key=lambda p: (p.is_file(), p.name.lower())
            )
        except PermissionError:
            return
        for entry in entries:
            if entry.name in IGNORE_DIRS or entry.name.startswith("."):
                if entry.name != ".git":
                    continue
                else:
                    continue
            if count >= max_entries:
                lines.append(f"{prefix}... (truncated)")
                return
            lines.append(f"{prefix}{entry.name}{'/' if entry.is_dir() else ''}")
            count += 1
            if entry.is_dir():
                walk(entry, depth + 1, prefix + "  ")

    walk(root, 0, "")
    return "\n".join(lines)


def scan_project(root: Path | None = None) -> ProjectContext:
    root = root or Path.cwd()
    found = [m for m in MARKERS if (root / m).exists()]
    is_git = (root / ".git").exists()
    return ProjectContext(
        root=root,
        markers_found=found,
        git_branch=_git_branch(root) if is_git else None,
        is_git_repo=is_git,
        file_tree_preview=_build_tree(root),
    )
