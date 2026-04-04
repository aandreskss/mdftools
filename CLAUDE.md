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

**MDF Tools** is a Next.js 16 / React 19 (App Router) SaaS dashboard that exposes AI-powered marketing tools. Each user brings their own API keys (Anthropic and/or Google Gemini), stored in the `brand_profiles` Supabase table.

### Route structure

- `app/(auth)/` — Login / Register pages
- `app/(dashboard)/dashboard/` — All protected tool pages (social, blog, seo, propuestas, workflows, crm, seo-suite, etc.)
- `app/api/` — API routes consumed by the dashboard
- `app/p/[id]/`, `app/view/[id]/`, `app/view/design/[id]/`, `app/view/sales/[id]/` — Public proposal viewing (no auth, served via service role client)

### Key libraries

| File | Purpose |
|------|---------|
| `lib/user-settings.ts` | Central AI config: `getUserSettings()` fetches user's API keys + model preferences from Supabase; `callAIJson()` routes non-streaming calls to Anthropic or Gemini; `noApiKeyResponse()` returns a 402 used by every API route when no key is configured |
| `lib/supabase/server.ts` | **async** `createClient()` (cookie-based, for Server Components/Route Handlers — always `await`) and `createServiceClient()` (service role, synchronous, bypasses RLS) |
| `lib/supabase/client.ts` | Synchronous `createClient()` for Client Components only |
| `lib/prompts.ts` | `getSystemPrompt(agentId, brandProfile)` — returns the system prompt for each AI agent |
| `lib/anthropic.ts` | Module-level `anthropic` singleton (legacy — prefer `getUserSettings` in new routes) |
| `types/index.ts` | `BrandProfile`, `Message`, `AgentId` |

### Two API route patterns

**CRUD routes** (no AI calls) — use only auth, no `getUserSettings`:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
// INSERT must include user_id: user.id explicitly — RLS can't inject it
// SELECT/DELETE are filtered automatically by RLS
```

**AI routes** (streaming or non-streaming) — require `getUserSettings`:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return noApiKeyResponse();

let settings: Awaited<ReturnType<typeof getUserSettings>>;
try { settings = await getUserSettings(supabase, user.id); }
catch { return noApiKeyResponse(); }

const model = settings.modelAgents; // or modelSeo / modelProposals / modelWorkflows
if (isGemini(model)) { /* fetch Gemini SSE */ }
else { /* anthropic.messages.stream(...) */ }
```

`app/api/chat/route.ts` is the main streaming endpoint for all dashboard agents. It assembles a system prompt from: brand profile + agent brain context + uploaded files + ad library, then streams via Anthropic or Gemini.

### Model selection

Four configurable slots per user in `brand_profiles`: `model_agents`, `model_seo`, `model_proposals`, `model_workflows`. Defaults live in `lib/user-settings.ts` (`DEFAULT_MODEL_*`). Provider is inferred by `isGemini(model)` — Anthropic for `claude-*`, Gemini for `gemini-*`.

### Supabase tables (all RLS-protected per `user_id`)

`brand_profiles` · `agent_contexts` · `agent_files` · `chat_history` · `proposals` · `design_proposals` · `sales_proposals` · `competitor_ads` · `ad_library` · `gsc_properties` · `workflows`

Full schema in `supabase/schema.sql`. Migrations in `supabase/migrations/`.

### Dashboard layout

`app/(dashboard)/layout.tsx` wraps all pages with `<Sidebar>` and `<ApiKeyBanner>`. Exports `dynamic = "force-dynamic"`. The sidebar is collapsible; its width is passed as a CSS variable `--sidebar-width` to offset `<main>`.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY          # fallback only; users provide their own keys via the UI
```

## Next.js 16 patterns (breaking vs. 14)

- **`createClient()` in `lib/supabase/server.ts` is async** — `await` it everywhere in server-side code.
- **`params` in dynamic route handlers is a `Promise`** — `const { id } = await params` before use.
- **Both `(dashboard)` and `(auth)` layouts export `dynamic = "force-dynamic"`** — prevents static prerender at build time without env vars.
- `middleware.ts` is deprecated; future rename is `proxy.ts` (still works).
