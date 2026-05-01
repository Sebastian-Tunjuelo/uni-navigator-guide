-- ============================================
-- Chat Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  response_sources JSONB DEFAULT '[]'::jsonb,
  model_used TEXT DEFAULT 'placeholder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own messages
CREATE POLICY "Users can read own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Buildings Table (Campus Map)
-- ============================================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('academic', 'service', 'residence', 'sport')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  icon VARCHAR(255),
  color VARCHAR(7),
  floor INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on location for geospatial queries
CREATE INDEX IF NOT EXISTS idx_buildings_category ON buildings(category);

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read buildings
CREATE POLICY "Buildings are publicly readable" ON buildings
  FOR SELECT USING (true);

-- ============================================
-- Routes Table (Connections between buildings)
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  distance INTEGER NOT NULL COMMENT 'Distance in meters',
  type VARCHAR(50) NOT NULL CHECK (type IN ('walking', 'shuttle', 'recommended')),
  duration INTEGER NOT NULL COMMENT 'Duration in minutes',
  waypoints JSONB DEFAULT 'null'::jsonb COMMENT 'Array of coordinate pairs [[x1,y1], [x2,y2], ...]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for route queries
CREATE INDEX IF NOT EXISTS idx_routes_from_id ON routes(from_id);
CREATE INDEX IF NOT EXISTS idx_routes_to_id ON routes(to_id);

-- Enable RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read routes
CREATE POLICY "Routes are publicly readable" ON routes
  FOR SELECT USING (true);

-- ============================================
-- User Bookmarks (Favorite Buildings)
-- ============================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_building UNIQUE(user_id, building_id)
);

-- Create indexes for bookmark queries
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_building_id ON user_bookmarks(building_id);

-- Enable RLS
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Documents Table (RAG - for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_building_id ON documents(building_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read documents
CREATE POLICY "Documents are publicly readable" ON documents
  FOR SELECT USING (true);

-- ============================================
-- Document Embeddings Table (RAG - for future use)
-- ============================================
-- Requires pgvector extension to be enabled:
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  -- embedding vector(1536) FOR OpenAI embeddings (uncomment when pgvector enabled)
  embedding_metadata JSONB DEFAULT '{}' COMMENT 'Metadata about the embedding (model, date, etc)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on document_id
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id ON document_embeddings(document_id);

-- Enable RLS
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read embeddings
CREATE POLICY "Embeddings are publicly readable" ON document_embeddings
  FOR SELECT USING (true);
