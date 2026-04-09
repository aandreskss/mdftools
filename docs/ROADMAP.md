# Roadmap de calidad y robustez

Estrategia por etapas para convertir mdftools en una aplicación production-ready a escala.

---

## Etapa 1 — Red de seguridad ✅ COMPLETADA

### 1.1 GitHub Action de CI básica ✅
- `.github/workflows/ci.yml` — lint → type-check → build → E2E
- Trigger en cada PR y push a `main`/`develop`

### 1.2 Tests E2E con Playwright ✅
- [x] Login con credenciales válidas → redirige a `/dashboard`
- [x] Login con credenciales inválidas → muestra error
- [x] Registro — validaci��n passwords no coinciden
- [x] Registro — validación mínimo 6 caracteres
- [x] Usuario no autenticado en `/dashboard` → redirige a `/login`
- [x] Usuario autenticado en `/login` → redirige a `/dashboard`
- [x] Dashboard carga sin errores JS en consola
- [x] Rutas del dashboard devuelven < 500
- [x] Smoke test streaming de un agente de chat (Gemini 2.5 Flash vía API real)

### 1.3 Pre-commit hooks ✅
- Husky + lint-staged instalados y configurados
- Bloquea commit si hay errores de lint

### 1.4 ESLint flat config ✅
- `eslint.config.mjs` con TypeScript-eslint
- 25+ errores reales corregidos en el codebase

### 1.5 TypeScript ✅
- `tsconfig.json`: target corregido de `es5` → `ES2017`
- Script `type-check` (`tsc --noEmit`)

---

## Etapa 2 — Seguridad y dependencias ✅ COMPLETADA (revisada en Etapa 2.5)

### 2.1 Vulnerabilidades
- `npm audit` en CI — falla si hay vulnerabilidades críticas
- Dependabot para PRs automáticos de dependencias

### 2.2 Security headers
En `next.config.js`:
- Content Security Policy (CSP)
- HSTS
- X-Frame-Options
- X-Content-Type-Options

### 2.3 Validación de entorno
- Zod schema para variables de entorno al startup
- Evita deploys rotos por `.env` incompleto

### 2.4 Auditoría Supabase
- Verificar que todas las tablas tienen RLS activado
- Revisar políticas de RLS

---

## Etapa 2.5 — Auditoría RLS ✅ COMPLETADA

La auditoría real de Supabase (marcada como pendiente en Etapa 2.4) encontró 3 gaps de seguridad:

### Hallazgos y fixes

| Severidad | Gap | Fix |
|-----------|-----|-----|
| **CRÍTICO** | `proposal_views` sin RLS — cualquier usuario autenticado podía leer views de propuestas ajenas | `ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY` + política SELECT por ownership |
| **CRÍTICO** | `/api/proposals/[id]/track` sin validar existencia de propuesta — permitía inyectar views falsas en IDs arbitrarios | Verificación de propuesta antes de insertar el view (404 si no existe) |
| **MEDIO** | Bucket `client-brief-files` sin política `FOR DELETE` — cualquiera podía borrar archivos de clientes ajenos | Política DELETE restringida al owner de la carpeta |
| **MEDIO** | Leaked password protection desactivada en Auth — usuarios podían registrarse con contraseñas filtradas | Activado en Supabase Auth Settings (QA y prod) |

### Archivos modificados
- `supabase/migrations/20260409000008_rls_security.sql` — RLS en `proposal_views` + política DELETE en storage
- `app/api/proposals/[id]/track/route.ts` — validación de existencia de propuesta

---

## Etapa 3 — Tests unitarios e integración ✅ COMPLETADA

### 3.1 Stack de testing
- **Vitest** instalado y configurado (`vitest.config.ts`)
- Scripts: `test:unit` (una vez) y `test:unit:watch` (modo watch)

### 3.2 Tests implementados (25 casos)
- `lib/user-settings.test.ts`: `isGemini`, `noApiKeyResponse`, `getUserSettings`, `callAIJson`
- `lib/prompts.test.ts`: `getSystemPrompt` — todos los agentIds, contexto de marca, campos opcionales

---

## Etapa 4 — CI/CD completo ✅ COMPLETADA (parcial)

### Pipeline CI (implementado)
```
PR abierto:
  lint → type-check → build   ← job: lint-and-build
  unit tests                  ← job: unit-tests (paralelo con E2E)
  E2E                         ← job: e2e (paralelo con unit tests)
```

### Configuraciones adicionales
- [x] Unit tests (`vitest run`) en CI — job `unit-tests`
- [x] PR template con checklist — `.github/pull_request_template.md`
- [x] Deploy automático — integración nativa Vercel (main → prod, PRs → preview)
- [ ] Branch protection: no merge sin CI verde ← configurar en GitHub Settings

---

## Etapa 5 — Calidad de código

- TypeScript strict mode (activar gradualmente, regla por regla)
- Prettier para formateo consistente
- Revisar código duplicado y abstracciones prematuras
- ADRs (Architecture Decision Records) para decisiones importantes

**Estado**: [ ] Pendiente

---

## Etapa 6 — Observabilidad

- **Sentry** para error tracking en producción
- Logging estructurado en API routes (request ID, duración, provider usado)
- Métricas de uso por feature (para priorizar desarrollo)

**Estado**: [ ] Pendiente

---

## Principio clave: cómo saber que no rompimos nada

```
Antes de cambiar X  →  tests pasan ✓
Hacer el cambio
Después del cambio  →  tests pasan ✓  →  cambio seguro
```
