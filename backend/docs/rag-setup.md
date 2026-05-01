# RAG Setup (Backend)

This setup wires the chat endpoint to a simple RAG flow:
- Retrieve from Supabase table `documents` (with optional pgvector RPC)
- Generate with OpenAI or Anthropic

## 1) Environment

Update `backend/.env.local` with your keys:

```
OPENAI_API_KEY=your-openai-key
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
# OR
ANTHROPIC_API_KEY=your-anthropic-key
ANTHROPIC_CHAT_MODEL=claude-3-5-sonnet-20240620
```

The system will prefer OpenAI if both are present.

## 2) Supabase Tables

Create a `documents` table. Minimal columns used by the API:

- `id` (uuid)
- `title` (text)
- `content` (text)
- `category` (text, optional)
- `embedding` (vector, optional if using pgvector)

## 3) Optional pgvector RPC

If you enable pgvector, add an RPC function:

```
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int
)
returns table (
  id uuid,
  title text,
  content text,
  category text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.title,
    documents.content,
    documents.category,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
```

If `match_documents` is missing, the code falls back to simple `.select()`.

## 4) Run backend

```
npm install
npm run dev
```

Chat endpoint: `POST /api/chat/message` (protected)

## 5) Notes

- `backend/src/services/rag.service.ts` handles retrieval and generation.
- `backend/src/services/llm.service.ts` handles OpenAI/Anthropic calls.
- `backend/src/routes/chat.ts` now uses RAG for chat replies.
