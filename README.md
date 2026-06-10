# Clearout — Listing Tracker

Mobile-first web app for logging Vinted resale listings, tracking engagement, and getting AI selling advice.

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (listings storage + optional `vinted-scrape` Edge Function)
- Anthropic API key (Advisor tab only)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your values
cp .env.example .env

# 3. Start dev server (http://localhost:8080)
npm run dev
```

> **Note:** The project folder name includes a trailing space (`Clearout insights `). Quote the path in terminal commands if needed.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Optional | Project reference (Lovable/Supabase tooling) |
| `VITE_ANTHROPIC_API_KEY` | Advisor only | Powers the AI Advisor tab |

Never commit `.env`. Use `.env.example` as the template.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **8080** (Advisor API proxied at `/api/advisor`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |

## Project structure

```
src/
├── pages/Index.tsx          # Main shell: tabs + layout
├── components/vinted/       # App-specific UI (Log, Entries, Stats, Advisor)
├── hooks/useListings.ts     # Listings CRUD + external store
├── lib/
│   ├── vintedScraper.ts     # Vinted URL fetch (Edge Function → proxy fallback)
│   ├── advisorHandler.ts    # Advisor prompt + API logic
│   └── listingOptions.ts    # Categories & conditions
└── integrations/supabase/   # Supabase client + generated types

supabase/
├── migrations/              # Postgres schema
└── functions/vinted-scrape/ # Server-side Vinted HTML parser
```

## Tabs

| Tab | Component | Purpose |
|-----|-----------|---------|
| Log | `LogTab.tsx` | Add listings; paste Vinted URL to auto-fill |
| Entries | `EntriesTab.tsx` | View/edit existing listings |
| Stats | `StatsTab.tsx` | Performance insights |
| Advisor | `AdvisorTab.tsx` | AI selling advice (Anthropic) |

## Supabase

### Listings table

Managed via `useListings()` — do not add parallel fetch logic. Key fields: `item`, `price`, `category`, `condition`, `views`, `sold`, `notes`.

### Migrations

```bash
# If using Supabase CLI locally
supabase db push
```

### Vinted scrape Edge Function

Deploy for reliable Vinted auto-fill (client tries Edge Function first, falls back to `allorigins.win`):

```bash
supabase functions deploy vinted-scrape
```

## Mobile layout

- Max content width: **480px**, centered
- Target device: iPhone 15 Pro (390×844 with safe areas)
- Root uses `max-w-full overflow-x-hidden` and `viewport-fit=cover`
- Design tokens live in `src/index.css` (HSL only)

## Working with Cursor

- **AGENTS.md** — high-level guide for AI agents
- **`.cursor/rules/`** — coding conventions (auto-loaded by Cursor)
- **`.cursor/skills/`** — repeatable workflows (invoke by name or when relevant)

### Suggested chat boundaries

| Chat topic | Example prompt |
|------------|----------------|
| New tab/feature | "Add a [feature] to [TabName] — see AGENTS.md" |
| Mobile fix | "Fix overflow on 390px in [component]" |
| Vinted scraping | "Update vintedScraper parsing for [field]" |
| Supabase | "Add migration for [column] on listings" |

## Deployment

Build output is static (`dist/`). Deploy to Vercel, Netlify, or similar.

- Set the same `VITE_*` env vars in the hosting dashboard
- Advisor in production uses `api/advisor.ts` (Vercel serverless) — dev uses Vite middleware in `vite.config.ts`
