# Virtual University Concierge — Documentación General

**Hackathon:** EPAM 2026 · Challenge 3 — University Orientation  
**Equipo:** Natalia Urbano Tovar, Sebastian Tunjuelo Lujan, Jerson Ramirez, Alfonso Ralacio  
**Fecha:** 30 de abril de 2026

---

## Visión del Proyecto

Aplicación móvil-first que ayuda a estudiantes de primer semestre a navegar el campus, reducir la ansiedad de orientación y conectarse con su comunidad universitaria. El enfoque es **Design Thinking**: resolver no solo el problema funcional (navegación), sino el emocional (inseguridad y soledad).

---

## Estructura del Repositorio

```
uni-navigator-guide/
├── src/                        # Frontend — React + TypeScript
│   ├── components/             # Componentes reutilizables
│   │   ├── layout/             # Shell móvil, header, nav
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── CampusMap.tsx       # Mapa interactivo (Canvas 2D)
│   │   ├── BuildingInfo.tsx    # Panel de info de edificio
│   │   ├── RouteFinder.tsx     # Selector origen/destino
│   │   └── SearchBar.tsx       # Búsqueda de edificios
│   ├── pages/                  # Rutas de la app
│   │   ├── Home.tsx            # Dashboard principal
│   │   ├── Mapa.tsx            # Mapa del campus
│   │   ├── BotChat.tsx         # Chat con UniBot (RAG)
│   │   ├── Chats.tsx           # Lista de chats
│   │   ├── GroupChat.tsx       # Chat grupal
│   │   ├── Carnet.tsx          # Carnet estudiantil
│   │   ├── Perfil.tsx          # Perfil del usuario
│   │   └── Login.tsx           # Autenticación
│   ├── data/                   # Datos del campus
│   │   ├── campus.ts           # Nodos/aristas (SVG simple)
│   │   ├── campus-extended.ts  # Dataset completo con coordenadas reales
│   │   └── campus-map-visual.ts
│   ├── utils/                  # Helpers
│   │   ├── campus-helpers.ts   # findRoute, getRouteLength, estimateWalkingTime
│   │   └── campus-utils.ts
│   ├── types/campus.ts         # Tipos Building, Route
│   └── integrations/supabase/ # Cliente Supabase frontend
│
├── backend/                    # Backend — Node.js + Express
│   ├── src/
│   │   ├── config/             # env, logger, supabase
│   │   ├── middleware/         # auth, errorHandler
│   │   ├── types/              # Tipos compartidos
│   │   └── scripts/            # generate-campus-pdf, ingest-pdf
│   ├── data/
│   │   ├── campus-guide.pdf    # PDF del campus (generado)
│   │   └── supabase-setup.sql  # SQL de setup para pgvector
│   └── docs/
│       └── rag-setup.md        # Guía de configuración RAG
│
├── supabase/
│   ├── migrations/             # Migraciones SQL
│   └── config.toml
│
├── docs/                       # Documentación del proyecto
│   ├── PROJECT.md              # Este archivo
│   ├── RAG.md                  # Documentación del sistema RAG
│   └── MAPA.md                 # Documentación del mapa interactivo
│
└── public/
    └── mapa-poblado.jpg        # Imagen de fondo del mapa
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Tipado estático |
| Vite | 5.4 | Build tool |
| Tailwind CSS | 3.4 | Estilos |
| shadcn/ui | latest | Componentes accesibles |
| React Router | 6.30 | Navegación SPA |
| TanStack Query | 5.83 | Server state |
| Supabase JS | 2.105 | Cliente DB/Auth |
| Recharts | 2.15 | Gráficas |
| Lucide React | 0.462 | Iconos |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.2 | HTTP server |
| TypeScript | 6.0 | Tipado estático |
| Supabase JS | 2.105 | DB client |
| Axios | 1.15 | HTTP requests a LLMs |
| Pino | 10.3 | Logging estructurado |
| PDFKit | 0.18 | Generación de PDFs |
| pdf-parse | 1.1.1 | Lectura de PDFs |

### Base de Datos (Supabase / PostgreSQL)
| Tabla | Descripción |
|---|---|
| `documents` | Chunks del PDF con embeddings vectoriales (RAG) |
| `chat_messages` | Historial de conversaciones con UniBot |
| `usuarios` | Usuarios del sistema |
| `productos` | (Proyecto anterior — no usar) |

### IA / LLM
| Servicio | Uso |
|---|---|
| Gemini 2.5 Flash | Chat principal (LLM) |
| Gemini embedding-001 | Embeddings vectoriales (768 dims) |
| Groq llama-3.3-70b | Fallback ultra-rápido |
| Supabase pgvector | Búsqueda semántica |

---

## Páginas y Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home` | Dashboard: materias, accesos rápidos |
| `/mapa` | `Mapa` | Mapa interactivo del campus |
| `/chats` | `Chats` | Lista de conversaciones |
| `/chats/bot` | `BotChat` | Chat con UniBot (RAG) |
| `/chats/grupo` | `GroupChat` | Chat grupal de estudiantes |
| `/carnet` | `Carnet` | Carnet estudiantil digital |
| `/perfil` | `Perfil` | Perfil del usuario |
| `/asignatura/:id` | `SubjectDetail` | Detalle de materia |

---

## Variables de Entorno

### Frontend (`.env` en raíz)
```env
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Backend (`backend/.env.local`)
```env
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo para scripts de ingestión
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
GEMINI_API_KEY=AIza...
GEMINI_CHAT_MODEL=gemini-2.5-flash
GROQ_API_KEY=gsk_...
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
```

> ⚠️ Nunca subir `.env.local` al repositorio. Está en `.gitignore`.

---

## Cómo Ejecutar

### Frontend
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Build de producción
npm run test       # Tests con Vitest
```

### Backend
```bash
cd backend
npm install
npm run dev        # http://localhost:3001 (nodemon)
npm run build      # Compila a dist/
npm run generate:pdf   # Genera data/campus-guide.pdf
npm run ingest:pdf     # Ingesta el PDF en Supabase
```

---

## Flujo de Datos Principal

```
Usuario → Frontend (React)
         ↓ fetch
Backend (Express :3001)
         ↓
    ┌────┴────┐
    │  RAG    │  → Supabase pgvector (búsqueda semántica)
    │ Service │  → Gemini (embeddings + chat)
    └────┬────┘
         ↓
    Respuesta con fuentes
         ↓
Frontend → Chat UI
```

---

## Decisiones de Arquitectura

**¿Por qué Express en lugar de Next.js API routes?**  
El backend está diseñado para ser workflow-ready (compatible con Temporal en el futuro). Separar frontend y backend facilita escalar el servicio de IA independientemente.

**¿Por qué Gemini en lugar de OpenAI?**  
Gemini tiene tier gratuito generoso para hackathons y el modelo `gemini-2.5-flash` tiene excelente relación calidad/velocidad. Groq se usa como fallback por su latencia ultra-baja.

**¿Por qué Canvas 2D en lugar de una librería de mapas?**  
El campus es un espacio cerrado con imagen de fondo personalizada. Canvas permite superponer nodos y rutas sobre la imagen real del campus sin depender de tiles externos.

**¿Por qué pgvector en Supabase?**  
El proyecto ya usa Supabase para auth y DB. Agregar pgvector evita introducir una nueva infraestructura (Pinecone, Weaviate, etc.) y mantiene todo en un solo proveedor.

---

## Estado Actual del Proyecto

| Feature | Estado |
|---|---|
| Mapa interactivo 2D | ✅ Implementado |
| Búsqueda de edificios | ✅ Implementado |
| Cálculo de rutas (Dijkstra) | ✅ Implementado |
| Chat con UniBot | ✅ Implementado |
| RAG con PDF del campus | ✅ Implementado |
| Embeddings semánticos | ✅ Activo (18 chunks en Supabase) |
| Chat grupal | ✅ UI implementada |
| Carnet estudiantil | ✅ Implementado |
| Tests | 🔄 Parcial (Vitest configurado) |
| Deploy producción | ⏳ Pendiente |
