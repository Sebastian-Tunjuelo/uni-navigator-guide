# Sistema RAG — UniBot Campus Guide

Documentación técnica del sistema de Retrieval-Augmented Generation que alimenta al chatbot UniBot.

---

## ¿Qué es RAG?

RAG (Retrieval-Augmented Generation) es un patrón que combina búsqueda semántica con generación de texto:

```
Pregunta del usuario
        ↓
  Convertir a vector (embedding)
        ↓
  Buscar chunks similares en la DB
        ↓
  Pasar chunks como contexto al LLM
        ↓
  LLM genera respuesta fundamentada
```

Sin RAG, el LLM solo responde con su conocimiento general. Con RAG, responde con información específica del campus UNTI.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   RAGChainService                    │
│                                                     │
│  queryRAG(userQuery)                                │
│       ↓                                             │
│  RetrieverService.hybridSearch()                    │
│       ↓                                             │
│  EmbeddingsService.embedText(query)  →  Gemini API  │
│       ↓                                             │
│  supabase.rpc('match_documents', embedding)         │
│       ↓                                             │
│  filterRelevantDocuments()                          │
│       ↓                                             │
│  formatContext(documents)                           │
│       ↓                                             │
│  LLMService.generateChatCompletion()  →  Gemini/Groq│
│       ↓                                             │
│  { answer, sources, tokens, model }                 │
└─────────────────────────────────────────────────────┘
```

---

## Servicios

### `EmbeddingsService`
**Archivo:** `backend/src/services/rag.service.ts`

Convierte texto en vectores numéricos usando Gemini.

```typescript
EmbeddingsService.embedText(text: string): Promise<number[] | null>
EmbeddingsService.embedMultiple(texts: string[]): Promise<(number[] | null)[]>
```

**Modelo:** `gemini-embedding-001` con `outputDimensionality: 768`  
**Dimensiones:** 768 (reducido desde 3072 para compatibilidad con índice HNSW de pgvector)

### `RetrieverService`
**Archivo:** `backend/src/services/rag.service.ts`

Busca documentos relevantes en Supabase.

```typescript
RetrieverService.searchDocuments(query, topK): Promise<any[]>
RetrieverService.hybridSearch(query, topK): Promise<any[]>
```

**Flujo de `hybridSearch`:**
1. Intenta búsqueda semántica con `match_documents()` (pgvector)
2. Si falla, cae a query simple `SELECT * FROM documents LIMIT topK`

### `RAGChainService`
**Archivo:** `backend/src/services/rag.service.ts`

Orquesta el flujo completo.

```typescript
RAGChainService.queryRAG(userQuery, userId?): Promise<{
  answer: string;
  sources: { title, content, category, similarity }[];
  tokens: { prompt, completion, total } | null;
  model: string | null;
}>
```

### `LLMService`
**Archivo:** `backend/src/services/llm.service.ts`

Abstracción sobre los proveedores de LLM.

```typescript
LLMService.generateChatCompletion(messages, temperature): Promise<LLMResult | null>
```

**Prioridad de proveedores:**
1. Gemini (si `GEMINI_API_KEY` está configurada)
2. Groq (si `GEMINI_API_KEY` no está disponible)

---

## Base de Datos (Supabase)

### Tabla `documents`

```sql
CREATE TABLE documents (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text,
  content     text,
  embedding   vector(768),      -- gemini-embedding-001 con outputDimensionality=768
  source      text,             -- 'campus-guide.pdf'
  category    text,             -- 'biblioteca', 'alimentacion', etc.
  created_at  timestamptz DEFAULT now()
);
```

### Función `match_documents`

```sql
CREATE FUNCTION match_documents(
  query_embedding vector(768),
  match_count     int DEFAULT 5,
  match_threshold float DEFAULT 0.3
)
RETURNS TABLE (id, title, content, source, category, similarity)
```

Usa **cosine similarity** (`<=>` operator de pgvector). Retorna los chunks más cercanos semánticamente a la query.

### Índice HNSW

```sql
CREATE INDEX documents_embedding_idx
  ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

HNSW (Hierarchical Navigable Small World) es el índice más rápido de pgvector para búsqueda aproximada de vecinos. Límite: 2000 dimensiones — por eso se usa 768 en lugar de 3072.

---

## Datos Actuales en Supabase

| Métrica | Valor |
|---|---|
| Total documentos | 22 |
| Con embeddings (del PDF) | 18 |
| Sin embeddings (datos legacy) | 4 |
| Fuente | `campus-guide.pdf` |
| Dimensión del vector | 768 |
| Índice | HNSW activo |

---

## PDF del Campus

### Generación
**Script:** `backend/src/scripts/generate-campus-pdf.ts`  
**Output:** `backend/data/campus-guide.pdf`

```bash
npm run generate:pdf
```

El PDF contiene 10 secciones inventadas sobre el campus UNTI:
1. Información General
2. Bloques y Edificios (A, B, C, D, E)
3. Biblioteca Central
4. Cafeterías y Alimentación
5. Servicios Estudiantiles
6. Transporte y Movilidad
7. Emergencias y Seguridad
8. Portal Estudiantil y Recursos Digitales
9. Calendario Académico 2026
10. Consejos para Primer Semestre

### Ingestión
**Script:** `backend/src/scripts/ingest-pdf.ts`

```bash
npm run ingest:pdf
```

**Proceso:**
1. Lee `campus-guide.pdf` con `pdf-parse`
2. Divide el texto en 18 chunks (600 chars, 100 de overlap)
3. Genera embedding de cada chunk con Gemini
4. Limpia documentos anteriores con `source = 'campus-guide.pdf'`
5. Inserta cada chunk en Supabase con su embedding y categoría

**Categorías auto-detectadas:** `biblioteca`, `alimentacion`, `instalaciones`, `bienestar`, `financiero`, `transporte`, `seguridad`, `digital`, `calendario`, `deportes`, `general`

---

## Filtrado de Documentos

`filterRelevantDocuments()` aplica lógica antes de pasar contexto al LLM:

1. **Conversación casual** (hola, gracias, ok, etc. < 40 chars) → retorna `[]` (no busca documentos)
2. **Keyword "biblioteca"** → filtra solo documentos que mencionen biblioteca
3. **Extracción de keywords** → elimina stopwords, filtra por palabras ≥ 4 chars
4. **Sin keywords útiles** → retorna `[]`

Esto evita pasar contexto irrelevante al LLM y reduce tokens.

---

## Prompt del Sistema (UniBot)

```
Eres UniBot, el asistente virtual de orientación universitaria para estudiantes de primer semestre.
Tu personalidad: cálido, cercano, empático y útil — como un compañero mayor que ya conoce el campus.
Responde SIEMPRE en español, de forma natural y conversacional.

REGLAS:
1. SALUDOS / CONVERSACIÓN CASUAL → Responde amigablemente, ofrece ayuda
2. PREGUNTAS CON CONTEXTO → Usa el contexto en 2-3 frases claras
3. PREGUNTAS SIN CONTEXTO → Admite que no tienes info, sugiere alternativas
4. PREGUNTAS FUERA DEL CAMPUS → Redirige amablemente hacia el campus
5. NUNCA respondas con listas de documentos, IDs, ni contexto crudo
```

---

## Fallback sin LLM

Si ningún LLM está disponible, `generateResponse()` usa regex hardcodeado:

| Patrón | Respuesta |
|---|---|
| `agua\|sed\|beber` | Dispensadores en pasillos y cafetería |
| `hambre\|comer\|cafeteria` | Cafetería Principal, horario y precios |
| `perdido\|donde\|ubicacion` | Usar pestaña Mapa de la app |
| `ansioso\|estres\|triste` | Centro de Bienestar, Bloque B piso 2 |
| `hola\|buenos\|hey` | Saludo y oferta de ayuda |
| `gracias\|perfecto` | Confirmación y oferta de más ayuda |
| (default) | Redirige a temas del campus |

---

## Configuración Requerida

### Variables de entorno (`backend/.env.local`)
```env
GEMINI_API_KEY=AIza...
GEMINI_CHAT_MODEL=gemini-2.5-flash
GROQ_API_KEY=gsk_...
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo para ingestión
```

### Setup inicial (una sola vez)
```bash
# 1. Ejecutar SQL en Supabase Dashboard → SQL Editor
cat backend/data/supabase-setup.sql

# 2. Generar el PDF
npm run generate:pdf

# 3. Ingestar el PDF
npm run ingest:pdf
```

---

## Re-ingestión

Para actualizar el contenido del campus:

```bash
# Editar generate-campus-pdf.ts con nueva información
npm run generate:pdf   # Regenera el PDF
npm run ingest:pdf     # Limpia los anteriores e inserta los nuevos
```

El script borra automáticamente los documentos con `source = 'campus-guide.pdf'` antes de insertar.

---

## Agregar Más Fuentes

Para ingestar un segundo PDF (ej: reglamento estudiantil):

```typescript
// Crear src/scripts/ingest-reglamento.ts
// Cambiar PDF_PATH y source en el insert:
const { error } = await supabase.from('documents').insert({
  title,
  content: chunk,
  embedding,
  source: 'reglamento-estudiantil.pdf',  // ← diferente source
  category: detectCategory(chunk),
});
```

La función `match_documents` busca en todos los documentos sin importar el source.

---

## Monitoreo

Los logs del backend incluyen:
- `RAG: Processing query for user X: "..."` — cada query
- `RAG: Retrieved N relevant documents` — documentos encontrados
- `RAG: Tokens used — prompt: X, completion: Y, total: Z` — uso de tokens
- `RAG: LLM unavailable, returning contextual fallback` — cuando no hay LLM

Nivel de log configurable con `LOG_LEVEL` en `.env.local`.
