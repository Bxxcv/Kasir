"""Tracks cumulative token usage and cost for the running session."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class UsageTracker:
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0

    def add(self, input_tokens: int, output_tokens: int, turn_cost: float) -> None:
        self.input_tokens += input_tokens
        self.output_tokens += output_tokens
        self.cost_usd += turn_cost

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens
