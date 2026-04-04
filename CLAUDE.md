# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

There are no automated tests in this project.

## Architecture Overview

**MDF Tools** is a Next.js 14 (App Router) SaaS dashboard that exposes AI-powered marketing tools. Each user brings their own API keys (Anthropic and/or Google Gemini), stored in the `brand_profiles` Supabase table.

### Route structure

- `app/(auth)/` — Login / Register pages
- `app/(dashboard)/dashboard/` — All protected tool pages (social, blog, seo, propuestas, workflows, crm, seo-suite, etc.)
- `app/api/` — API routes consumed by the dashboard
- `app/p/[id]/`, `app/view/[id]/` — Public proposal viewing (no auth)

### Key libraries

| File | Purpose |
|------|---------|
| `lib/user-settings.ts` | Central AI config: `getUserSettings()` fetches user's API keys + model preferences from Supabase; `callAIJson()` routes non-streaming calls to Anthropic or Gemini; `noApiKeyResponse()` returns a 402 used by every API route when no key is configured |
| `lib/supabase/server.ts` | `createClient()` (cookie-based, for Server Components/Route Handlers) and `createServiceClient()` (service role, bypasses RLS) |
| `lib/supabase/client.ts` | `createClient()` for Client Components |
| `lib/prompts.ts` | `getSystemPrompt(agentId, brandProfile)` — returns the system prompt for each AI agent |
| `lib/anthropic.ts` | Module-level `anthropic` singleton and `MODEL` constant (used in a few older routes; prefer `getUserSettings` in new code) |
| `types/index.ts` | `BrandProfile`, `Message`, `AgentId` |

### AI routing pattern

Every API route that calls AI follows this pattern:

```ts
const settings = await getUserSettings(supabase, user.id);
// settings.anthropic   — Anthropic client (or undefined)
// settings.geminiApiKey — string (or undefined)
// settings.modelAgents / modelSeo / modelProposals / modelWorkflows

if (isGemini(model)) { /* fetch Gemini SSE */ }
else { /* anthropic.messages.stream(...) */ }
```

The chat route (`app/api/chat/route.ts`) is the main streaming endpoint for all dashboard agents. It assembles a system prompt from: brand profile + agent brain context + uploaded files + ad library, then streams via Anthropic or Gemini depending on the selected model.

### Model selection

Four model slots are configurable per user (stored in `brand_profiles`): `model_agents`, `model_seo`, `model_proposals`, `model_workflows`. Defaults are defined in `lib/user-settings.ts` (`DEFAULT_MODEL_*`). Supported providers: Anthropic (`claude-*`) and Gemini (`gemini-*`).

### Supabase tables (all RLS-protected per `user_id`)

`brand_profiles` · `agent_contexts` · `agent_files` · `chat_history` · `proposals` · `design_proposals` · `sales_proposals` · `competitor_ads` · `ad_library` · `gsc_properties` · `workflows`

Full schema in `supabase/schema.sql`. Migrations in `supabase/migrations/`.

### Dashboard layout

`app/(dashboard)/layout.tsx` wraps all pages with `<Sidebar>` and `<ApiKeyBanner>`. The sidebar is collapsible; its width is passed as a CSS variable `--sidebar-width` to offset `<main>`.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY          # fallback only; users provide their own keys via the UI
```
