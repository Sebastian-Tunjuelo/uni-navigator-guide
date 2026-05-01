# Tareas Backend - Virtual University Concierge

## Objetivo
Implementar un servidor Express.js con Node.js que actúe como puente entre el frontend React y los servicios de RAG, vectorización y autenticación con Supabase.

---

## FASE 1: Setup Inicial del Backend

### Tarea 1.1: Inicializar proyecto Node.js
- [ ] Crear carpeta `/backend` en la raíz del proyecto
- [ ] Inicializar `npm init` con configuración estándar
- [ ] Instalar dependencias principales:
  - `express` - Framework web
  - `dotenv` - Variables de entorno
  - `cors` - Cross-Origin Resource Sharing
  - `@supabase/supabase-js` - Cliente Supabase
  - `axios` - HTTP client
  - `typescript` - Tipado estático
  - `ts-node` - Ejecutar TypeScript directo
  - `nodemon` - Auto-reload en desarrollo

**Comando referencia:**
```bash
npm install express cors dotenv @supabase/supabase-js axios
npm install -D typescript ts-node nodemon @types/node @types/express
```

### Tarea 1.2: Configurar TypeScript
- [ ] Crear `tsconfig.json` en `/backend`
- [ ] Configurar rutas absolutas para imports
- [ ] Compilar a `dist/` para producción

### Tarea 1.3: Estructura de carpetas
```
/backend
├── src/
│   ├── index.ts           # Punto de entrada
│   ├── config/
│   │   ├── supabase.ts    # Cliente Supabase
│   │   └── env.ts         # Variables de entorno
│   ├── routes/
│   │   ├── health.ts      # Healthcheck
│   │   ├── chat.ts        # Endpoints del chatbot RAG
│   │   └── campus.ts      # Endpoints del mapa
│   ├── services/
│   │   ├── rag.service.ts # Lógica RAG
│   │   └── auth.service.ts # Autenticación
│   └── middleware/
│       ├── errorHandler.ts
│       └── auth.ts
├── .env.local
├── package.json
└── tsconfig.json
```

### Tarea 1.4: Archivo .env
- [ ] Crear `.env.local` con:
  ```
  VITE_SUPABASE_URL=<tu-url>
  VITE_SUPABASE_ANON_KEY=<tu-key>
  NODE_ENV=development
  PORT=3001
  ```
- [ ] Agregar `.env.local` a `.gitignore`

---

## FASE 2: Configuración Base del Servidor

### Tarea 2.1: Server básico con Express
- [ ] Crear `src/index.ts` con:
  - Inicializar Express
  - Middleware CORS habilitado
  - Middleware JSON parser
  - Rutas básicas
  - Manejo de errores global
  - Listen en puerto 3001

**Pseudocódigo:**
```typescript
const app = express();
app.use(cors());
app.use(express.json());
// routes...
app.listen(3001, () => console.log('Server running'));
```

### Tarea 2.2: Ruta Health Check
- [ ] Crear GET `/api/health`
- [ ] Responder con status y timestamp
- [ ] Usar para verificar que el servidor está vivo

### Tarea 2.3: Configurar Cliente Supabase
- [ ] Crear `src/config/supabase.ts`
- [ ] Inicializar cliente con variables de entorno
- [ ] Exportar instancia reutilizable
- [ ] Crear función de conexión verificable

### Tarea 2.4: Scripts npm
- [ ] `npm run dev` → `ts-node src/index.ts` con nodemon
- [ ] `npm run build` → Compilar TypeScript a dist/
- [ ] `npm start` → node dist/index.js

---

## FASE 3: Autenticación Básica

### Tarea 3.1: Auth con Supabase
- [ ] Crear `src/services/auth.service.ts` con:
  - Función login (email/contraseña)
  - Función signup (registro)
  - Función logout
  - Verificación de sesión
  - Refresh token automático

### Tarea 3.2: Middleware de Autenticación
- [ ] Crear `src/middleware/auth.ts`
- [ ] Verificar JWT en headers
- [ ] Extraer usuario del token
- [ ] Pasar usuario al request
- [ ] Rechazar sin token válido

### Tarea 3.3: Rutas de Auth
- [ ] POST `/api/auth/signup` - Registro
- [ ] POST `/api/auth/login` - Login
- [ ] POST `/api/auth/logout` - Logout
- [ ] GET `/api/auth/me` - Usuario actual (protegida)

---

## FASE 4: API del Chatbot (Prep para RAG)

### Tarea 4.1: Endpoints básicos del chat
- [ ] POST `/api/chat/message` - Enviar mensaje
  - Input: `{ message: string, userId: string }`
  - Output: `{ id: string, response: string, timestamp: Date }`
- [ ] GET `/api/chat/history/:userId` - Historial
- [ ] DELETE `/api/chat/:messageId` - Eliminar mensaje

### Tarea 4.2: Almacenar mensajes en Supabase
- [ ] Crear tabla `chat_messages` con:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `message` (text)
  - `response` (text, nullable inicialmente)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### Tarea 4.3: Servicio de Chat básico
- [ ] Crear `src/services/chat.service.ts`
- [ ] Guardar mensaje del usuario
- [ ] Retornar respuesta por ahora (placeholder)
- [ ] Recuperar historial

---

## FASE 5: Integración con LangChain RAG (Futuro)

### Tarea 5.1: Preparación de LangChain
- [ ] Instalar dependencias LangChain:
  - `langchain` - Framework base
  - `langchain/embeddings` - Para embeddings
  - `langchain/vectorstores` - Supabase como vector store
  - `langchain/llms` - Modelo LLM

### Tarea 5.2: Embeddings y Vector Store
- [ ] Configurar Supabase para pgvector
- [ ] Crear tabla `documents` con embedding
- [ ] Crear tabla `embeddings` para almacenar vectores
- [ ] Función para embeddear documentos

### Tarea 5.3: RAG Chain
- [ ] Integrar con `langchain-rag` skill
- [ ] Crear cadena: user query → embedding → search vectorial → context → LLM
- [ ] Usar respuesta del LLM como chatbot response

---

## FASE 6: API del Mapa

### Tarea 6.1: Endpoints del Campus
- [ ] GET `/api/campus/buildings` - Lista de edificios
- [ ] GET `/api/campus/routes/:from/:to` - Ruta entre edificios
- [ ] GET `/api/campus/nearby/:lat/:lng` - Edificios cercanos
- [ ] POST `/api/campus/bookmark` - Guardar ubicación favorita (protegida)

### Tarea 6.2: Base de Datos del Campus
- [ ] Crear tabla `buildings`:
  - `id`, `name`, `description`, `latitude`, `longitude`, `category`
- [ ] Crear tabla `routes`:
  - `id`, `from_building_id`, `to_building_id`, `distance`, `description`
- [ ] Crear tabla `user_bookmarks`:
  - `id`, `user_id`, `building_id`, `created_at`

### Tarea 6.3: Servicio de Campus
- [ ] Crear `src/services/campus.service.ts`
- [ ] Lógica de búsqueda de edificios
- [ ] Cálculo de rutas (A* o Dijkstra)
- [ ] Búsqueda por proximidad (geolocalización)

---

## FASE 7: Testing & Deployment

### Tarea 7.1: Testing básico
- [ ] Instalar `jest` y `@types/jest`
- [ ] Escribir tests para endpoints principales
- [ ] Coverage mínimo 60%

### Tarea 7.2: Logging y Monitoreo
- [ ] Instalar `winston` o `pino` para logs
- [ ] Loguear requests/responses
- [ ] Loguear errores con contexto

### Tarea 7.3: Deployment
- [ ] Crear `Dockerfile` para backend
- [ ] Configurar `docker-compose.yml` con Supabase local
- [ ] Variables de entorno en producción
- [ ] Desplegar en Vercel/Railway/Heroku

---

## Notas Técnicas

### Stack Recomendado
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL (Supabase)
- **Vector DB**: Supabase pgvector
- **ORM**: Supabase JS Client (sin ORM pesado)
- **RAG**: LangChain
- **Testing**: Jest
- **Logging**: Winston

### Consideraciones de Seguridad
- ✅ CORS configurado correctamente
- ✅ JWT en headers Authorization
- ✅ Variables de entorno sensibles en .env.local
- ✅ Rate limiting en endpoints públicos
- ✅ Validación de input con Zod/Joi
- ✅ Sanitizar queries a Supabase

### Performance
- Caché de embeddings (Redis en el futuro)
- Índices en Supabase para búsquedas vectoriales
- Paginación en endpoints de lista
- Compression de respuestas

---

## Checklist de Finalización

- [ ] Backend corriendo en localhost:3001
- [ ] CORS configurado (frontend en localhost:5173)
- [ ] Supabase conectado y autenticado
- [ ] Rutas de auth funcionales
- [ ] Rutas de chat almacenando mensajes
- [ ] Rutas de campus retornando datos
- [ ] Tests pasando
- [ ] .env.local en .gitignore
- [ ] Documentación API completa
- [ ] Logs en cada endpoint
