# myai

AI Coding Agent CLI open source. Berjalan lokal, kamu bawa API key sendiri.

Status: **fondasi (Phase 1-3) — chat streaming real ke provider sungguhan sudah
berfungsi.** Fitur tools (edit file, git, dsb) menyusul di phase berikutnya.

## Instalasi

```bash
git clone <repo-url> myai
cd myai
uv venv && source .venv/bin/activate     # atau: python -m venv .venv
uv pip install -e .                       # atau: pip install -e .
cp .env.example .env
# isi API key di .env
```

## Pemakaian

```bash
myai                      # sama seperti `myai chat`
myai chat -p anthropic -m claude-sonnet-5
myai doctor                # cek environment & konektivitas provider
myai config show
myai config set provider anthropic
myai config set temperature 0.2
```

Di dalam sesi chat:

- `/reset` — mulai sesi baru
- `/exit` atau `/quit` — keluar
- `Ctrl+C` — keluar paksa

## Provider yang didukung

`openai`, `anthropic`, `gemini`, `openrouter`, `groq`, `deepseek`, `ollama`
(lokal, tanpa API key).

## Arsitektur

```
src/myai/
  cli/        entry point Typer + commands
  llm/        abstraksi provider (base.py) + implementasi per vendor
  config/     .env + config.yaml
  core/       exceptions, usage tracker, project scanner
  history/    persistensi SQLite
  tools/      (menyusul) filesystem/git/terminal tools untuk agent
  agent/      (menyusul) autonomous coding loop
  memory/     (menyusul) project & conversation memory + RAG
```

## Roadmap

- [x] Phase 1 — Scaffold project (clean architecture)
- [x] Phase 2 — Core engine (config, exceptions, logger, usage, project scan)
- [x] Phase 3 — CLI (Typer + Rich streaming chat, doctor, config)
- [ ] Phase 4 — LLM tool-calling loop (agent dapat memanggil tools)
- [ ] Phase 5 — Filesystem tools (read/write/edit/delete/search/tree)
- [ ] Phase 6 — Git tools
- [ ] Phase 7 — Memory (project/session/summary + SQLite)
- [ ] Phase 8 — Diff preview & approval, safe-mode untuk command berbahaya
- [ ] Phase 9 — UI lanjutan (status bar penuh, token/cost live, panel diff)
- [ ] Phase 10 — Autonomous agent loop
- [ ] Phase 11 — Testing
- [ ] Phase 12 — Optimasi (codebase index, chunking, caching)

## Lisensi

MIT
