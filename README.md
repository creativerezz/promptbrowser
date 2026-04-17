# Prompt Browser

**Live site → [promptbrowser.cc](https://promptbrowser.cc)**

A fast, browsable UI over a 30-vendor archive of leaked and published **system prompts and tool schemas** from the AI coding agents shaping how we ship software — Cursor, v0, Claude Code, Codex CLI, Devin, Windsurf, Replit, Warp, VSCode Agent, and more.

Read the prompts, search every line, diff how a single agent's prompt evolved across versions, or compare two agents side-by-side.

> Built on the prompt corpus collected by [@x1xhlol](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools). All prompts are archived verbatim from their original sources.

---

## Features

- **Vendor index** — 30+ AI coding agents, instant filter
- **Full-text search** — substring search across every `.txt`/`.md` prompt with highlighted snippets and deep-links
- **Diff view** — line-level diff between two prompt versions (perfect for `Cursor Prompts/v1.0` → `2.0` → `2025-09-03`)
- **Side-by-side compare** — raw two-pane view of two prompts in the same vendor
- **Polished viewer** — JSON pretty-print, copy, line-wrap toggle, line/char stats
- **Dark / light mode** with system preference

## Stack

- Next.js 15 (App Router, React 19)
- Tailwind CSS v4
- shadcn/ui-style local primitives — no registry dependency
- `diff` for line-level diffing
- `lucide-react` icons, `next-themes` for theming

## Repo layout

```
.
├── prompts/           # The archive — one directory per vendor (Cursor, v0, …)
├── prompt-explorer/   # The Next.js app
└── assets/            # Brand assets used by the original archive
```

The data loader walks `prompts/` at build time, so nothing is duplicated and adding a new vendor is just a `git mv`.

## Quick start

```bash
cd prompt-explorer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
cd prompt-explorer
npm run build
npm start
```

## Routes

| Route | What it does |
|---|---|
| `/` | Vendor grid + name filter |
| `/[vendor]` | Vendor detail with file viewer |
| `/[vendor]/compare?a=…&b=…&mode=diffside` | Compare two prompts in a vendor |
| `/search?q=…` | Full-text search across every prompt |
| `/api/search` | JSON endpoint backing the search page |

## Adding a new vendor

1. Drop a directory under `prompts/` named after the product.
2. Add `Prompt.txt` (or `*Prompt.txt` split by mode/model) and optionally `Tools.json`.
3. Versions get separate files — `Agent Prompt v1.0.txt`, `Agent Prompt 2.0.txt`, `Agent Prompt 2025-09-03.txt`. Never overwrite history.
4. Restart `next dev` — the vendor appears automatically.

## Credits

The prompt corpus is collected by [@x1xhlol](https://github.com/x1xhlol). This repo adds the `prompt-explorer` app and the `prompts/` reorganization.
