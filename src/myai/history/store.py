"""SQLite persistence for sessions and message history.

Real disk-backed storage — sessions survive across CLI invocations so
`myai chat` can later support session restore.
"""
from __future__ import annotations

import sqlite3
import uuid
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

from myai.config.settings import DB_PATH, ensure_dirs

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    cwd TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
"""


class HistoryStore:
    def __init__(self, db_path: Path | None = None) -> None:
        ensure_dirs()
        self.db_path = db_path or DB_PATH
        with closing(self._connect()) as conn:
            conn.executescript(_SCHEMA)
            conn.commit()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def start_session(self, provider: str, model: str) -> str:
        session_id = str(uuid.uuid4())
        with closing(self._connect()) as conn:
            conn.execute(
                "INSERT INTO sessions (id, provider, model, cwd, created_at) VALUES (?, ?, ?, ?, ?)",
                (session_id, provider, model, str(Path.cwd()), datetime.now(timezone.utc).isoformat()),
            )
            conn.commit()
        return session_id

    def append_message(self, session_id: str, role: str, content: str) -> None:
        with closing(self._connect()) as conn:
            conn.execute(
                "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (session_id, role, content, datetime.now(timezone.utc).isoformat()),
            )
            conn.commit()

    def list_sessions(self, limit: int = 20) -> list[sqlite3.Row]:
        with closing(self._connect()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.execute(
                "SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?", (limit,)
            )
            return cur.fetchall()

    def get_messages(self, session_id: str) -> list[sqlite3.Row]:
        with closing(self._connect()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.execute(
                "SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,)
            )
            return cur.fetchall()
