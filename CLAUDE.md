# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This repo has two parts:

1. **The archive (`prompts/<vendor>/`)** — leaked/published system prompts and tool schemas from 30+ AI coding agents (Cursor, v0, Devin, Windsurf, Replit, Claude Code, Codex CLI, Gemini CLI, Warp, VSCode Agent, etc.). These are primary-source documents; **there is no build or test pipeline for them** — the "source" is the prompt text itself.
2. **`prompt-explorer/`** — a Next.js 15 app that serves a browsable UI over the archive. This is the only part with a real toolchain.

## Repository layout

Each directory under `prompts/` is one vendor/product. Within a vendor directory you'll typically find some combination of:

- `Prompt.txt` / `System.txt` / `*Prompt.txt` — the system prompt(s), sometimes split by mode (e.g. `Agent Prompt`, `Chat Prompt`, `Builder Prompt`) or by model (e.g. `gpt-5.txt`, `claude-sonnet-4.txt`, `gemini-2.5-pro.txt`).
- `Tools.json` / `tools.json` — the JSON schema for that agent's tool/function-calling interface.
- Occasionally a vendor-specific `README.md` (e.g. `Amp/README.md`).

Versioned prompts are kept as separate files rather than overwritten — e.g. `Cursor Prompts/` holds `Agent Prompt v1.0.txt`, `Agent Prompt v1.2.txt`, `Agent Prompt 2.0.txt`, `Agent Prompt 2025-09-03.txt` side by side. Preserve this pattern when adding a new capture; never overwrite a historical prompt.

Several directory names contain spaces (`Cursor Prompts/`, `v0 Prompts and Tools/`, `Open Source prompts/`, `Manus Agent Tools & Prompt/`, `Traycer AI/`). Quote paths in shell commands.

## Conventions for edits

- **Preserve prompts verbatim.** These files are primary sources. Do not reformat, "fix" typos, rewrap lines, normalize quotes, or strip trailing whitespace — downstream readers rely on them being faithful captures. Only edit a prompt file if the user explicitly asks to correct a transcription error.
- **When adding a new vendor/version**, match the existing convention: create a directory named for the product, and use `Prompt.txt` + `Tools.json` filenames where applicable. If the vendor ships multiple modes or models, split into separate files the way `Cursor Prompts/`, `VSCode Agent/`, and `Augment Code/` already do.
- **README.md is maintained by the upstream author** (`@NotLucknite` / `x1xhlol`) and contains sponsor/support links and a "Latest Update" date. Don't rewrite it for style; only touch it if the user explicitly asks.
- **LICENSE is GPL-3.0.** Don't modify.

## Navigating the content

- Use `Glob` with patterns like `**/Prompt.txt` or `**/Tools.json` to enumerate across vendors.
- Use `Grep` to compare how different agents phrase the same concept (e.g. tool-use discipline, refusal policy, file-edit rules) — cross-vendor comparison is the main reason this repo exists.
- Files can be large (multi-thousand-line prompts). Prefer targeted `Grep` over full `Read` when hunting for a specific rule.

## The `prompt-explorer/` Next.js app

A Next.js 15 (App Router, React 19) + Tailwind v4 + shadcn-style UI that reads the archive at build time and renders a vendor index + per-vendor file viewer. Run everything from inside `prompt-explorer/`:

```bash
cd prompt-explorer
npm install
npm run dev     # next dev — http://localhost:3000
npm run build   # next build (static-generates a page per vendor)
npm run start   # next start
npm run lint    # next lint
```

There is no test runner configured. Path alias `@/*` maps to `prompt-explorer/src/*` (see `tsconfig.json`).

### How it reads the archive — the load-bearing detail

`src/lib/prompts.ts` resolves the archive as `path.resolve(process.cwd(), "..")` — it walks the **parent** directory of wherever Next is executed. Consequences:

- The app **must be run from `prompt-explorer/`** (not from the repo root). Running `next dev` from the root will make it try to walk `/Users/...`.
- The sub-app directory itself is excluded via `IGNORED_DIRS` (`.git`, `.github`, `node_modules`, `prompt-explorer`, `.next`), which is how it avoids recursing into itself.
- `IGNORED_ROOT_FILES` skips `README.md`, `LICENSE.md`, `CLAUDE.md`, `.gitignore`, `.DS_Store` at the repo root. **If you add new top-level meta files (e.g. `CONTRIBUTING.md`), add them to this set** or they'll appear as a bogus "vendor."
- A directory only shows up if it contains at least one non-dotfile — empty vendor dirs are dropped.
- `getVendors()` memoises results in a module-level `cachedVendors`, so changes to the archive during `next dev` require a restart (or triggering a server reload) to be reflected.
- `classifyFile()` tags a file as `"tools"` when its lowercased name ends with `.json` **and** contains `"tool"`, or contains `"tool"` and ends with `.txt`/`.json`. Renaming a tool schema to something like `functions.json` will misclassify it as `"other"` and it won't get the wrench icon/tools badge.

### Routing & data flow

- `src/app/page.tsx` → vendor grid (`VendorGrid` client component handles live search).
- `src/app/[vendor]/page.tsx` → server component. Uses `generateStaticParams()` to pre-render every vendor slug, reads the selected file server-side via `readPromptFile`, and passes its text to the `FileViewer` client component. File selection is driven by a `?file=<relPath>` search param.
- `readPromptFile` truncates at 2 MB and appends `\n\n... [truncated] ...`; viewer-side code should not assume it received the full file.
- Slugs come from `slugify()` in `src/lib/utils.ts` — that's the canonical mapping from vendor dir name (often containing spaces) to URL segment. Use `getVendorBySlug` rather than reconstructing slugs by hand.

### When editing the explorer vs. the archive

- Changes to prompt files in the archive are data changes; the explorer picks them up on next build. **Do not** "fix" prompts for display (wrapping, quotes, etc.) — see the archive conventions above.
- Changes to the explorer UI should not require touching the archive. If you find yourself adding a special case in `prompts.ts` for one specific vendor, prefer changing the vendor's file names/layout to fit the existing classifier over hard-coding vendor names in code.
