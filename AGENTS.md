# Agent guide — Clearout

## What this app is

A mobile-first Vinted listing tracker. Users log items, track views/sales, and get AI advice. Data persists in Supabase `listings` table.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (`src/components/ui/`)
- TanStack Query (provider only; listings use custom external store)
- Supabase for DB; Anthropic for Advisor

## Key files — read these first

| Area | File |
|------|------|
| App shell & tabs | `src/pages/Index.tsx` |
| Listings data | `src/hooks/useListings.ts` |
| Log new item | `src/components/vinted/LogTab.tsx` |
| Vinted auto-fill | `src/lib/vintedScraper.ts` |
| Categories/conditions | `src/lib/listingOptions.ts` |
| Design tokens | `src/index.css` |
| Supabase client | `src/integrations/supabase/client.ts` |

## Conventions

### Data layer

- All listing reads/writes go through `useListings()` — no direct Supabase calls in components
- Use `notesDbValue()` when saving optional `notes` (handles pre-migration DBs)
- `Listing` type is defined in `useListings.ts`; keep in sync with Supabase types

### UI

- App-specific components live in `src/components/vinted/`
- Reuse shadcn primitives from `src/components/ui/` — don't duplicate
- Mobile-first: max width 480px, no fixed widths > 390px, safe-area insets on bottom UI
- Form labels use `text-label uppercase tracking-[1px]` pattern from `LogTab.tsx`

### Vinted scraping

- URL detection: `isVintedUrl()` in `vintedScraper.ts`
- Fetch order: Supabase Edge Function → `allorigins.win` proxy fallback
- Parsing logic is duplicated in `vintedScraper.ts` and `supabase/functions/vinted-scrape/index.ts` — keep both in sync when changing parsers
- Always fail gracefully; user can enter fields manually

### Advisor

- Client calls `runAdvisor()` from `advisorHandler.ts`
- Dev: Vite middleware at `/api/advisor` (see `vite.config.ts`)
- Prod: `api/advisor.ts` serverless route
- Requires `VITE_ANTHROPIC_API_KEY`

### Scope discipline

- One tab or feature per task — don't refactor unrelated tabs
- Don't edit `src/integrations/supabase/client.ts` (auto-generated)
- Don't commit `.env` or API keys

## Adding a new feature

1. Identify which tab (`log` | `entries` | `insights` | `advisor`) or shared lib it belongs to
2. If it touches listings, extend `useListings.ts` and/or Supabase migrations
3. Match existing Tailwind patterns and `index.css` tokens
4. Test at 390px width before finishing

## Running locally

```bash
npm install && npm run dev
# → http://localhost:8080
```

See `README.md` for full setup, env vars, and deployment.
