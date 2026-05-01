# Virtual University Concierge - Backend

Node.js + Express.js + TypeScript backend para la aplicación de orientación universitaria.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Logging**: Pino
- **CORS**: habilitado para localhost:5173 (frontend)

## Setup

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Crea `.env.local` en la carpeta `backend/`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# RAG/LLM (opcional, para futuro)
# OPENAI_API_KEY=your-key
# ANTHROPIC_API_KEY=your-key
```

### 3. Crear tablas en Supabase

Ejecuta el SQL en `supabase/migrations/20260501_000000_create_tables.sql` en el SQL Editor de Supabase:

```sql
-- Copia y pega el contenido en Supabase SQL Editor
```

## Scripts npm

```bash
# Desarrollo (con nodemon y hot reload)
npm run dev

# Build a TypeScript
npm run build

# Iniciar desde build compilado
npm start
```

## Estructura de carpetas

```
backend/
├── src/
│   ├── index.ts              # Entrada principal
│   ├── config/
│   │   ├── env.ts            # Variables de entorno
│   │   ├── supabase.ts       # Cliente Supabase
│   │   └── logger.ts         # Logger Pino
│   ├── routes/
│   │   ├── health.ts         # GET /api/health
│   │   ├── auth.ts           # POST /api/auth/*
│   │   ├── chat.ts           # POST /api/chat/*
│   │   └── campus.ts         # GET/POST /api/campus/*
│   ├── services/
│   │   ├── auth.service.ts   # Lógica de autenticación
│   │   ├── chat.service.ts   # Lógica de chat
│   │   ├── campus.service.ts # Lógica de mapa del campus
│   │   └── rag.service.ts    # Servicios para RAG (futuro)
│   ├── middleware/
│   │   ├── auth.ts           # Middleware de autenticación
│   │   └── errorHandler.ts   # Manejo global de errores
│   └── types/
│       ├── auth.ts           # Tipos de autenticación
│       ├── chat.ts           # Tipos de chat
│       └── campus.ts         # Tipos del campus
├── .env.local                # Variables locales (no committed)
├── .gitignore
├── package.json
└── tsconfig.json
```

## API Endpoints

### Health Check
- `GET /api/health` - Verifica que el servidor está vivo

### Autenticación
- `POST /api/auth/signup` - Registro (email, password)
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/logout` - Logout (requiere token)
- `GET /api/auth/me` - Usuario actual (requiere token)

### Chat
- `POST /api/chat/message` - Enviar mensaje (requiere token)
- `GET /api/chat/history` - Historial de chat (requiere token)
- `DELETE /api/chat/:messageId` - Eliminar mensaje (requiere token)
- `DELETE /api/chat/clear/all` - Limpiar historial (requiere token)

### Campus
- `GET /api/campus/buildings` - Lista de edificios
- `GET /api/campus/buildings/:id` - Edificio por ID
- `GET /api/campus/buildings/category/:category` - Edificios por categoría
- `GET /api/campus/routes/:from/:to` - Ruta entre edificios
- `GET /api/campus/nearby?lat=X&lng=Y&radius=1` - Edificios cercanos
- `POST /api/campus/bookmark` - Guardar favorito (requiere token)
- `DELETE /api/campus/bookmark/:buildingId` - Eliminar favorito (requiere token)
- `GET /api/campus/bookmarks` - Mis favoritos (requiere token)

## Autenticación

Las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <access_token>
```

El token se obtiene en `/api/auth/login` o `/api/auth/signup`.

## Manejo de Errores

El servidor retorna errores en formato JSON:

```json
{
  "error": "Error message",
  "details": "Additional details (si aplica)",
  "timestamp": "ISO date"
}
```

Códigos de estado HTTP:
- `200` - OK
- `201` - Created
- `400` - Bad Request (validación)
- `401` - Unauthorized (auth)
- `404` - Not Found
- `500` - Server Error

## Logging

Pino registra todos los eventos. En desarrollo, usa `pino-pretty` para formato legible.

Niveles:
- `debug` - Información detallada
- `info` - Eventos importantes
- `warn` - Advertencias
- `error` - Errores

## Arquitectura Workflow-Ready

El backend está diseñado para ser orquestable con patrones de workflow (workflow-orchestration-patterns skill):

### Workflow Pattern: Chat Response

```
User Query
    ↓
[Middleware: Auth]
    ↓
[Service: ChatService.storeMessage] - Activity
    ↓
[Service: RAGChainService.queryRAG] - Orchestration
    ├→ Retrieve documents
    ├→ Format context
    ├→ Generate response
    └→ Return with sources
    ↓
[Service: ChatService.updateMessageResponse] - Activity
    ↓
Response to Client
```

**Ventajas:**
- Cada operación es una "activity" (idempotente)
- La lógica de coordinación es clara (en servicios)
- Fácil migración a Temporal si se escala

## Preparación para RAG (Fase 5)

El archivo `src/services/rag.service.ts` contiene placeholders para:

1. **EmbeddingsService** - Vectorizar texto con OpenAI/HuggingFace
2. **RetrieverService** - Búsqueda vectorial en Supabase pgvector
3. **RAGChainService** - Orquestación: Query → Retrieve → Generate

Cuando se agreguen API keys en `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

La clase `RAGChainService` ejecutará la cadena completa en `queryRAG()`.

## Próximos Pasos

1. **Configurar Supabase** - Crear proyecto y ejecutar migraciones
2. **Crear tablas** - Ejecutar SQL en Supabase
3. **Testear endpoints** - Usar Postman/curl
4. **Integrar con Frontend** - Actualizar URLs de API en React
5. **Implementar RAG** - Agregar LangChain y embeddings (Fase 5)
6. **Desplegar** - Railway, Vercel, o Heroku

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [LangChain RAG Skill](https://skills.sh/langchain-ai/langchain-skills/langchain-rag)
- [Workflow Orchestration Patterns](https://docs.temporal.io)
