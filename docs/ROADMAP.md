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

## Etapa 2 — Seguridad y dependencias

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

**Estado**: [ ] Pendiente

---

## Etapa 3 — Tests unitarios e integración

### 3.1 Stack de testing
- **Vitest** (más rápido que Jest, compatible con Next.js App Router)
- `@testing-library/react` para componentes
- Supabase mockeado para tests de API routes

### 3.2 Qué testear primero (mayor ROI)
- `lib/user-settings.ts`: `getUserSettings`, `isGemini`, `callAIJson`, `noApiKeyResponse`
- `lib/prompts.ts`: `getSystemPrompt` por agentId
- API routes críticas: `/api/chat`, `/api/proposals`
- Middleware: lógica de redirección auth

**Estado**: [ ] Pendiente

---

## Etapa 4 — CI/CD completo

### Pipeline completo
```
PR abierto:
  lint → type-check → unit tests → E2E → build

Merge a main:
  Todo lo anterior → deploy a Vercel (producción)

Merge a develop:
  Todo lo anterior → deploy a Vercel (staging)
```

### Configuraciones adicionales
- Environments en GitHub con secrets separados (staging / production)
- Branch protection: no merge sin CI verde
- PR template con checklist (tests, docs, security)
- Revisión de código requerida antes de merge

**Estado**: [ ] Pendiente

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
