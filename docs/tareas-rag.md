# Tareas RAG - Virtual University Concierge

## Objetivo
Transformar el chatbot estático en un sistema inteligente Retrieval-Augmented Generation (RAG) que pueda buscar información relevante en la base de datos del campus y generar respuestas contextuales usando LLM.

---

## FASE 1: Fundamentos de RAG

### Tarea 1.1: Entender la arquitectura RAG
- [ ] Leer documentación de LangChain RAG skill
- [ ] Entender flujo: Query → Embeddings → Vector Search → Context → LLM
- [ ] Identificar componentes:
  - Embeddings model (e.g., OpenAI, Hugging Face)
  - Vector store (Supabase pgvector)
  - LLM (GPT-4, Claude, etc.)
  - Retriever (búsqueda vectorial)

### Tarea 1.2: Preparar documentos del campus
- [ ] Crear corpus de información:
  - Descripción de cada edificio
  - Servicios disponibles
  - Horarios
  - FAQ de estudiantes primerizos
  - Rutas populares
- [ ] Estructura documento:
  ```
  {
    "title": "Biblioteca Central",
    "building_id": "uuid",
    "content": "Texto completo con información relevante",
    "category": "servicios",
    "metadata": { "floor": 3, "open_24h": true }
  }
  ```

### Tarea 1.3: Embeddings Model
- [ ] Elegir modelo de embeddings:
  - OpenAI (recomendado, pago)
  - Hugging Face (gratuito, local)
  - Cohere (alternativa)
- [ ] Instalar dependencia:
  ```bash
  npm install @langchain/openai  # si usas OpenAI
  ```
- [ ] Configurar API key en .env

---

## FASE 2: Setup de Vector Store con Supabase

### Tarea 2.1: Habilitar pgvector en Supabase
- [ ] En Supabase dashboard:
  - Ir a SQL Editor
  - Ejecutar:
    ```sql
    create extension if not exists vector;
    ```
- [ ] Verificar extensión creada

### Tarea 2.2: Crear tabla de embeddings
- [ ] Ejecutar en Supabase SQL:
  ```sql
  create table documents (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    category text,
    building_id uuid,
    metadata jsonb,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );

  create table document_embeddings (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references documents(id) on delete cascade,
    embedding vector(1536),  -- Para OpenAI embeddings
    created_at timestamp default now()
  );

  -- Índice para búsqueda vectorial rápida
  create index on document_embeddings using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);
  ```

### Tarea 2.3: Políticas RLS
- [ ] Crear políticas RLS para tablas:
  - Todos pueden leer documents
  - Solo admin puede escribir documents
- [ ] Crear políticas para user_queries (historial)

---

## FASE 3: Embeddings - Vectorizar Documentos

### Tarea 3.1: Crear servicio de embeddings
- [ ] Crear `src/services/embeddings.service.ts` con:
  - Función `embedText(text: string)` → vector
  - Función `embedMultiple(texts: string[])` → vectors[]
  - Manejo de errores y retry logic
  - Caché local opcional

**Pseudocódigo:**
```typescript
import { OpenAIEmbeddings } from '@langchain/openai';

export async function embedDocument(content: string) {
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  return await embeddings.embedQuery(content);
}
```

### Tarea 3.2: Función para seed de documentos
- [ ] Crear script `src/scripts/seed-documents.ts`:
  - Leer documentos del campus
  - Embeddear cada uno
  - Guardar en Supabase
  - Verificar que se crearon correctamente
- [ ] Ejecutar una sola vez

**Script referencia:**
```bash
npx ts-node src/scripts/seed-documents.ts
```

### Tarea 3.3: Actualizar documentos
- [ ] Crear endpoint POST `/api/admin/documents`
  - Agregar nuevo documento
  - Embeddear automáticamente
  - Guardar en DB
- [ ] Crear endpoint PUT `/api/admin/documents/:id`
  - Actualizar documento
  - Re-embeddear si cambió contenido

---

## FASE 4: Retriever - Búsqueda Vectorial

### Tarea 4.1: Implementar SupabaseVectorStore
- [ ] Crear `src/services/retriever.service.ts`
- [ ] Usar `SupabaseVectorStore` de LangChain:
  ```typescript
  import { SupabaseVectorStore } from '@langchain/supabase';
  
  const vectorStore = new SupabaseVectorStore(
    embeddings,
    { client: supabaseClient, tableName: 'document_embeddings' }
  );
  ```

### Tarea 4.2: Función de búsqueda semántica
- [ ] Función `searchDocuments(query: string, topK: number = 5)`:
  - Embeddear query del usuario
  - Hacer búsqueda vectorial en Supabase
  - Retornar top K documentos relevantes
  - Incluir score de similitud

**Pseudocódigo:**
```typescript
export async function searchDocuments(query: string) {
  const queryEmbedding = await embedText(query);
  const results = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    similarity_threshold: 0.5,
    match_count: 5
  });
  return results;
}
```

### Tarea 4.3: Función de búsqueda hibrida (opcional)
- [ ] Combinar búsqueda vectorial + búsqueda keyword
- [ ] Usar PostgreSQL full-text search + pgvector
- [ ] Mejorar relevancia para queries simples

---

## FASE 5: RAG Chain - LLM Integration

### Tarea 5.1: Crear RAG chain con LangChain
- [ ] Crear `src/services/rag-chain.service.ts`
- [ ] Usar skill `langchain-rag` como referencia
- [ ] Estructura:
  1. Recibir query de usuario
  2. Retriever busca documentos relevantes
  3. Formatter prepara contexto
  4. LLM genera respuesta basada en contexto
  5. Retornar respuesta

**Pseudocódigo:**
```typescript
import { RetrievalQAChain } from 'langchain/chains';
import { SupabaseVectorStore } from '@langchain/supabase';

export async function createRAGChain() {
  return RetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    { returnSourceDocuments: true }
  );
}

export async function queryRAG(question: string) {
  const chain = await createRAGChain();
  const result = await chain.call({ query: question });
  return {
    answer: result.text,
    sources: result.sourceDocuments
  };
}
```

### Tarea 5.2: Configurar LLM (Claude, GPT-4, etc.)
- [ ] Elegir LLM:
  - OpenAI GPT-4 (mejor calidad, más caro)
  - Anthropic Claude (equilibrio)
  - Open source local (privado)
- [ ] Instalar dependencia:
  ```bash
  npm install @langchain/anthropic  # si usas Claude
  ```
- [ ] Configurar API key en .env
- [ ] Testear con query simple

### Tarea 5.3: Prompt Engineering
- [ ] Crear prompt template específico para campus:
  ```
  Eres un asistente amigable de orientación para estudiantes de primer semestre.
  Contexto del campus: {context}
  Pregunta del estudiante: {question}
  Respuesta:
  ```
- [ ] Optimizar tono y claridad
- [ ] Agregar instrucciones para respuestas útiles

---

## FASE 6: Integración con Chatbot Backend

### Tarea 6.1: Actualizar endpoint de chat
- [ ] Modificar POST `/api/chat/message`:
  - Recibir mensaje del usuario
  - Ejecutar RAG chain
  - Guardar respuesta en DB
  - Retornar respuesta + sources
- [ ] Response schema:
  ```json
  {
    "id": "uuid",
    "message": "texto del usuario",
    "response": "respuesta del RAG",
    "sources": [
      { "title": "...", "similarity": 0.95 }
    ],
    "timestamp": "ISO date"
  }
  ```

### Tarea 6.2: Agregar sources/context al historial
- [ ] Extender tabla `chat_messages`:
  - `response_sources` (jsonb)
  - `model_used` (text: "rag-v1")
- [ ] Mostrar sources en frontend para transparencia

### Tarea 6.3: Feedback del usuario
- [ ] Crear endpoint POST `/api/chat/:messageId/feedback`:
  - Usuario indica si respuesta fue útil
  - Guardar feedback para mejorar
  - Usar para fine-tuning futuro

---

## FASE 7: Optimizaciones y Fine-Tuning

### Tarea 7.1: Caché de queries frecuentes
- [ ] Redis o memcached para cachear:
  - Queries comunes + respuestas
  - TTL de 24 horas
- [ ] Mejorar latencia y costos de API

### Tarea 7.2: Monitoreo de RAG
- [ ] Loguear todas las queries y respuestas
- [ ] Métrica de relevancia (feedback usuario)
- [ ] Dashboard de queries más frecuentes
- [ ] Mejorar documentos según patrones

### Tarea 7.3: Fine-tuning del modelo (futuro)
- [ ] Recolectar feedback de usuarios
- [ ] Fine-tune con ejemplos buenos/malos
- [ ] Mejorar respuestas específicas del campus

---

## FASE 8: Testing y Validación

### Tarea 8.1: Test queries RAG
- [ ] Crear suite de test queries:
  - "¿Dónde es la biblioteca?"
  - "¿A qué hora cierra el comedor?"
  - "¿Cómo llego a [edificio]?"
- [ ] Verificar relevancia de respuestas
- [ ] Validar sources correctas

### Tarea 8.2: Benchmarks
- [ ] Medir latencia: query → respuesta
- [ ] Medir costo de embeddings/LLM
- [ ] Validar precisión de retriever
- [ ] Optimizar si es necesario

### Tarea 8.3: User testing
- [ ] Beta testing con estudiantes reales
- [ ] Recolectar feedback
- [ ] Mejorar documentos del campus
- [ ] Ajustar prompts según respuestas

---

## Diagrama del Flujo RAG

```
Usuario escribe: "¿Dónde está la biblioteca?"
        ↓
    [Backend API]
    POST /api/chat/message
        ↓
    [Embeddings Service]
    Vectorizar query → [0.1, 0.5, ..., 0.8]
        ↓
    [Retriever - Supabase pgvector]
    Búsqueda vectorial top 5
    Documentos: ["Biblioteca: ...", "Servicios: ...", ...]
        ↓
    [RAG Chain - LangChain]
    Formato: Query + Context → Prompt
        ↓
    [LLM - Claude/GPT-4]
    Generar respuesta inteligente
        ↓
    [Chat Service]
    Guardar en DB
        ↓
    [Response to Frontend]
    { response, sources, timestamp }
```

---

## Checklist de Finalización

- [ ] pgvector habilitado en Supabase
- [ ] Tablas de embeddings creadas
- [ ] Documentos del campus sembrados
- [ ] Embeddings service funcional
- [ ] Retriever busca documentos correctos
- [ ] LLM configurado y testado
- [ ] RAG chain completa
- [ ] Endpoint `/api/chat/message` retorna RAG responses
- [ ] Frontend muestra sources
- [ ] Latencia aceptable (<2s)
- [ ] Tests pasando
- [ ] Documentación completa

---

## Recursos

- [LangChain RAG Skill](https://skills.sh/langchain-ai/langchain-skills/langchain-rag)
- [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [LangChain Supabase](https://js.langchain.com/docs/integrations/vectorstores/supabase)
- [OpenAI Embeddings](https://platform.openai.com/docs/models/embeddings)

