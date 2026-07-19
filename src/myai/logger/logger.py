"""Rotating file logger. Never writes secrets (API keys) to disk."""
from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from myai.config.settings import LOG_DIR, ensure_dirs

_CONFIGURED = False


def get_logger(name: str = "myai") -> logging.Logger:
    global _CONFIGURED
    logger = logging.getLogger(name)
    if not _CONFIGURED:
        ensure_dirs()
        logger.setLevel(logging.INFO)
        handler = RotatingFileHandler(
            Path(LOG_DIR) / "myai.log",
            maxBytes=2_000_000,
            backupCount=5,
            encoding="utf-8",
        )
        handler.setFormatter(
            logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
        )
        logger.addHandler(handler)
        _CONFIGURED = True
    return logger
