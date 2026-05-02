-- ============================================================
-- Supabase Setup para RAG con Gemini gemini-embedding-001
-- Dimensión del vector: 3072 (gemini-embedding-001)
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Habilitar extensión pgvector
create extension if not exists vector;

-- 2. Crear tabla de documentos
create table if not exists documents (
  id          bigserial primary key,
  title       text not null,
  content     text not null,
  embedding   vector(3072),         -- gemini-embedding-001 = 3072 dims
  source      text,                 -- nombre del archivo origen (ej: campus-guide.pdf)
  category    text,                 -- categoría detectada automáticamente
  created_at  timestamptz default now()
);

-- 3. Índice HNSW para búsqueda semántica rápida (cosine similarity)
create index if not exists documents_embedding_idx
  on documents
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 4. Función match_documents para búsqueda semántica
--    Usada por RetrieverService.searchDocuments()
create or replace function match_documents(
  query_embedding vector(3072),
  match_count     int default 5,
  match_threshold float default 0.5
)
returns table (
  id         bigint,
  title      text,
  content    text,
  source     text,
  category   text,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.title,
    d.content,
    d.source,
    d.category,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Habilitar Row Level Security (RLS) — lectura pública, escritura solo service role
alter table documents enable row level security;

create policy "Allow public read"
  on documents for select
  using (true);

-- Para insertar desde el script de ingestión usa la service role key en .env.local:
-- SUPABASE_SERVICE_ROLE_KEY=eyJ...
-- La encuentras en: Supabase Dashboard → Project Settings → API → service_role
