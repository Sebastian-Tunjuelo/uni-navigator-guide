// Tipos para chat y RAG
export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response?: string;
  response_sources?: ChatSource[];
  model_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatSource {
  title: string;
  content?: string;
  similarity?: number;
  building_id?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  id: string;
  message: string;
  response: string;
  sources?: ChatSource[];
  timestamp: string;
}
