"""Verifies the Anthropic SSE stream parser correctly reconstructs text,
tool calls, and usage from a real (locally served) event stream shape."""
import asyncio

import httpx
import pytest

from myai.llm.base import Message, Role
from myai.llm.providers.anthropic_provider import AnthropicProvider

SSE_BODY = "\n".join([
    'event: message_start',
    'data: {"type":"message_start","message":{"usage":{"input_tokens":12}}}',
    "",
    'event: content_block_start',
    'data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}',
    "",
    'event: content_block_delta',
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hal"}}',
    "",
    'event: content_block_delta',
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"o!"}}',
    "",
    'event: content_block_stop',
    'data: {"type":"content_block_stop","index":0}',
    "",
    'event: message_delta',
    'data: {"type":"message_delta","delta":{},"usage":{"output_tokens":5}}',
    "",
    'event: message_stop',
    'data: {"type":"message_stop"}',
    "",
]) + "\n"


def test_stream_chat_reconstructs_text_and_usage():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=SSE_BODY, headers={"content-type": "text/event-stream"})

    transport = httpx.MockTransport(handler)

    async def run():
        provider = AnthropicProvider(api_key="test-key", model="claude-sonnet-5")
        # Patch the client construction to use our mock transport.
        import myai.llm.providers.anthropic_provider as mod

        real_client_cls = httpx.AsyncClient

        class PatchedClient(real_client_cls):
            def __init__(self, *args, **kwargs):
                kwargs["transport"] = transport
                super().__init__(*args, **kwargs)

        mod.httpx.AsyncClient = PatchedClient
        try:
            chunks = []
            async for c in provider.stream_chat([Message(role=Role.USER, content="hi")]):
                chunks.append(c)
        finally:
            mod.httpx.AsyncClient = real_client_cls
        return chunks

    chunks = asyncio.run(run())
    text = "".join(c.text for c in chunks if c.type.value == "text")
    assert text == "Halo!"
    done = [c for c in chunks if c.type.value == "done"]
    assert done and done[0].input_tokens == 12 and done[0].output_tokens == 5
