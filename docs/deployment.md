# Deployment Guide

## Architecture

| Layer    | Platform | Notes |
|----------|----------|-------|
| Frontend | Lovable  | Ya desplegado automáticamente desde Lovable |
| Backend  | Render   | Express + Node.js, deploy desde GitHub |
| Database | Supabase | Postgres + pgvector para RAG |

---

## Backend → Render

### 1. Crear cuenta en Render
Ve a [render.com](https://render.com) y conecta tu cuenta de GitHub.

### 2. Nuevo Web Service
- Click **New → Web Service**
- Conecta el repositorio `uni-navigator-guide`
- Render detectará el `render.yaml` automáticamente y pre-llenará la configuración

### 3. Configuración manual (si no usa render.yaml)
| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Node Version | 20 |

### 4. Variables de entorno en Render Dashboard
Ve a **Environment** y agrega estas variables (los valores están en `backend/.env.local`):

```
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=<tu-url>
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
GEMINI_API_KEY=<tu-api-key>
GEMINI_CHAT_MODEL=gemini-2.5-flash
GROQ_API_KEY=<tu-api-key>
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=https://<tu-app>.lovable.app
```

### 5. Deploy
Click **Deploy**. El primer deploy tarda ~3 minutos.

Tu API quedará en: `https://virtual-university-concierge-api.onrender.com`

Verifica con: `https://virtual-university-concierge-api.onrender.com/api/health`

---

## Frontend → Lovable

### Conectar el backend desplegado
En Lovable, ve a **Project Settings → Environment Variables** y agrega:

```
VITE_BACKEND_URL=https://virtual-university-concierge-api.onrender.com
```

Lovable re-desplegará automáticamente.

---

## Notas importantes

- **Free tier de Render**: el servicio entra en sleep después de 15 min de inactividad. El primer request tarda ~30s en despertar. Para el hackathon está bien; para producción real usa el plan Starter ($7/mes).
- **CORS**: el backend acepta automáticamente cualquier dominio `*.lovable.app`. Si usas un dominio custom, agrega `FRONTEND_URL` en Render.
- **Ingest PDF**: el script `npm run ingest:pdf` debe correrse localmente (o como un Render Job) con `SUPABASE_SERVICE_ROLE_KEY` configurado.
