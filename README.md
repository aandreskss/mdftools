# MDF Tools

Plataforma SaaS de herramientas de marketing con IA. Cada usuario conecta su propia API key de Anthropic o Google Gemini para usar los agentes.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **React 19**
- **Supabase** — autenticación y base de datos
- **Anthropic / Google Gemini** — modelos de IA configurables por usuario

---

## Requisitos previos

- Node.js 20+
- npm
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito es suficiente para desarrollo)

---

## Configuración

### 1. Clona el repositorio e instala dependencias

```bash
git clone <repo-url>
cd mdftools
npm install
```

### 2. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Las tres claves las encuentras en tu proyecto de Supabase en **Settings → API**.

### 3. Inicializa la base de datos

En el panel de Supabase, ve a **SQL Editor**, pega el contenido del archivo `supabase/schema.sql` y ejecútalo. Esto crea todas las tablas con sus políticas RLS.

### 4. Levanta el servidor de desarrollo

```bash
npm run dev
```

La app quedará disponible en [http://localhost:3000](http://localhost:3000).

---

## Primeros pasos en la app

1. **Regístrate** en `/register` con tu email.
2. Ve a **Perfil de Marca** (`/dashboard/perfil`) y configura:
   - Los datos de tu marca (nombre, industria, tono, público objetivo, etc.)
   - Tu **API key de Anthropic** y/o **Google Gemini** — sin esto los agentes no funcionan.
   - El modelo de IA que quieres usar por categoría (agentes, SEO, propuestas, workflows).
3. Usa cualquier herramienta del dashboard.

> Los usuarios traen su propia API key; la plataforma no incluye una clave compartida.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Inicia el build de producción
npm run lint     # Linting con ESLint
```

---

## Variables de entorno — referencia completa

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (privada, solo en servidor) |

---

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Agrega las tres variables de entorno en **Settings → Environment Variables**.
3. Vercel detecta automáticamente Next.js; no se requiere configuración adicional.

El proyecto incluye un cron job configurado en `vercel.json` que limpia datos temporales diariamente a las 3 AM UTC (`/api/cron/cleanup`).
