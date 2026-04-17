# Prompt Explorer

A polished Next.js 15 + Tailwind v4 + shadcn/ui frontend for browsing the system prompts archived in this repository.

## Features

- **Vendor index** with live search across 30+ AI coding agents
- **Prompt viewer** with JSON pretty-printing, copy, line-wrap toggle, and stats
- **Dark / light mode** via `next-themes` (defaults to dark)
- Reads directly from the parent repo's folder structure at build time — no data duplication
- Static generation for every vendor page

## Stack

- Next.js 15 (App Router, React 19)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- shadcn/ui-style primitives (local, no registry dependency)
- `lucide-react` icons
- `next-themes` for theme switching

## Getting started

```bash
cd prompt-explorer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Layout

```
prompt-explorer/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, theme provider, header/footer
│   │   ├── page.tsx            # Home: vendor grid + search
│   │   ├── globals.css         # Tailwind v4 + theme tokens
│   │   ├── not-found.tsx
│   │   └── [vendor]/
│   │       ├── page.tsx        # Vendor detail (file list + viewer)
│   │       └── file-viewer.tsx # Client-side viewer with copy/wrap
│   ├── components/
│   │   ├── ui/                 # Button, Card, Input, Badge
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── vendor-grid.tsx     # Client search + grid
│   └── lib/
│       ├── prompts.ts          # Reads ../ and builds the vendor index
│       └── utils.ts
└── package.json
```

The data loader (`src/lib/prompts.ts`) walks `process.cwd() + '/..'`, so the app must live inside the prompt archive repo to work. Ignored directories: `.git`, `.github`, `node_modules`, `prompt-explorer`, `.next`.
