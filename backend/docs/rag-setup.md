# RAG Setup — UniBot Campus Guide

## Stack
- **Embeddings**: Gemini `gemini-embedding-001` (3072 dims)
- **Vector DB**: Supabase + pgvector
- **LLM**: Gemini `gemini-2.5-flash` (primary) / Groq `llama-3.3-70b-versatile` (fallback)

---

## Paso 1 — Ejecutar SQL en Supabase

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de `backend/data/supabase-setup.sql`

Esto crea:
- Extensión `pgvector`
- Tabla `documents` con columna `embedding vector(3072)`
- Índice HNSW para búsqueda semántica rápida
- Función `match_documents()` para similarity search

---

## Paso 2 — Agregar Service Role Key

La ingestión necesita permisos de escritura. El `anon key` no puede insertar con RLS activo.

1. En Supabase Dashboard → **Project Settings** → **API**
2. Copia la **service_role** key (la que dice "secret")
3. Agrégala a `backend/.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Esta key tiene acceso total a la base de datos. Nunca la expongas al frontend ni la subas a Git.

---

## Paso 3 — Generar el PDF del campus

```bash
cd backend
npm run generate:pdf
```

Genera `backend/data/campus-guide.pdf` con información inventada del campus UNTI.

---

## Paso 4 — Ingestar el PDF

```bash
cd backend
npm run ingest:pdf
```

El script:
1. Lee `data/campus-guide.pdf`
2. Divide el texto en 18 chunks (~600 chars con 100 de overlap)
3. Genera embeddings con Gemini `gemini-embedding-001` (3072 dims)
4. Inserta cada chunk en la tabla `documents` de Supabase con su embedding y categoría

Salida esperada:
```
🚀 Iniciando ingestión del PDF del campus...
📄 PDF leído: ~9000 caracteres
✂️  Dividido en 18 chunks
🗑️  Limpiando documentos anteriores...
[1/18] Embeddiendo: "Guía del Campus Universitario..."  ✅
[2/18] Embeddiendo: "cafeterías, una biblioteca..."  ✅
...
📊 Resultado:
   ✅ Insertados: 18
   ❌ Errores:    0
```

---

## Cómo funciona el RAG en el chatbot

```
Usuario: "¿Dónde está la biblioteca?"
         ↓
EmbeddingsService.embedText(query)  →  vector[3072]
         ↓
RetrieverService.searchDocuments()  →  match_documents() en Supabase
         ↓
Top 3 chunks más similares semánticamente
         ↓
RAGChainService.generateResponse()  →  Gemini con contexto
         ↓
"La Biblioteca Central está entre los bloques A y C..."
```

---

## Re-ingestión

Si modificas el PDF o quieres actualizar el contenido:

```bash
npm run generate:pdf   # regenera el PDF
npm run ingest:pdf     # limpia los anteriores e inserta los nuevos
```

El script borra automáticamente los documentos con `source = 'campus-guide.pdf'` antes de insertar.

---

## Agregar más PDFs

Para ingestar otro PDF, modifica `ingest-pdf.ts` cambiando `PDF_PATH` o crea un nuevo script que llame a las mismas funciones con una ruta diferente.
