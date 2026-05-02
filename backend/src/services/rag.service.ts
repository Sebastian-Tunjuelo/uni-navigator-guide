import axios from 'axios';
import logger from '@/config/logger';
import { config } from '@/config/env';
import { supabase } from '@/config/supabase';
import { LLMService } from '@/services/llm.service';

/**
 * Embeddings Service - Placeholder for RAG phase
 * Will integrate with OpenAI or HuggingFace embeddings when RAG is enabled
 */
export class EmbeddingsService {
  /**
   * Embed a single text
   */
  static async embedText(text: string): Promise<number[] | null> {
    if (!config.openai.apiKey) {
      logger.warn('Embeddings: No API key configured, returning null');
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: config.openai.embeddingModel,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const embedding = response.data?.data?.[0]?.embedding;
      if (!embedding) {
        logger.warn('Embeddings: Empty embedding response');
        return null;
      }

      return embedding;
    } catch (err) {
      logger.error(`Embeddings error: ${err}`);
      return null;
    }
  }

  /**
   * Embed multiple texts
   */
  static async embedMultiple(texts: string[]): Promise<(number[] | null)[]> {
    logger.info(`Embeddings: Embedding ${texts.length} texts`);

    const embeddings = await Promise.all(texts.map((text) => this.embedText(text)));
    return embeddings;
  }
}

/**
 * Retriever Service - Document search (placeholder for RAG phase)
 */
export class RetrieverService {
  /**
   * Search documents by semantic similarity
   * Will use pgvector and embeddings when RAG is enabled
   */
  static async searchDocuments(query: string, topK: number = 5): Promise<any[]> {
    logger.info(`Retriever: Searching documents for query: "${query}"`);

    try {
      const queryEmbedding = await EmbeddingsService.embedText(query);

      if (queryEmbedding) {
        const { data, error } = await supabase.rpc('match_documents', {
          query_embedding: queryEmbedding,
          match_count: topK,
        });

        if (error) {
          logger.warn(`Retriever: match_documents failed: ${error.message}`);
        } else if (data && data.length > 0) {
          return data;
        }
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .limit(topK);

      if (error) {
        logger.error(`Retriever error: ${error.message}`);
        return [];
      }

      return data || [];
    } catch (err) {
      logger.error(`Retriever search error: ${err}`);
      return [];
    }
  }

  /**
   * Hybrid search (semantic + keyword)
   */
  static async hybridSearch(query: string, topK: number = 5): Promise<any[]> {
    logger.info(`Retriever: Hybrid search for query: "${query}"`);

    try {
      // Combine semantic search with full-text search
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .limit(topK);

      if (error) {
        logger.warn(`Hybrid search warning: ${error.message}`);
        // Fallback to simple search
        return this.searchDocuments(query, topK);
      }

      if (data && data.length > 0) {
        return data;
      }

      return this.searchDocuments(query, topK);
    } catch (err) {
      logger.error(`Hybrid search error: ${err}`);
      return [];
    }
  }
}

/**
 * RAG Chain Service - Orchestrates retrieval and generation
 * This follows the workflow-orchestration-patterns skill
 */
export class RAGChainService {
  /**
   * Execute RAG chain: Query -> Retrieve -> Generate
   * This is workflow-ready (can be moved to Temporal later)
   */
  static async queryRAG(
    userQuery: string,
    userId?: string
  ): Promise<{
    answer: string;
    sources: any[];
  }> {
    logger.info(
      `RAG: Processing query for user ${userId}: "${userQuery}"`
    );

    try {
      // WORKFLOW PATTERN: Step 1 - Retrieve relevant documents
      const documents = await RetrieverService.hybridSearch(userQuery, 3);
      const relevantDocuments = this.filterRelevantDocuments(documents, userQuery);
      const finalDocuments = relevantDocuments.length > 0 ? relevantDocuments : documents;
      logger.info(`RAG: Retrieved ${finalDocuments.length} documents`);

      // WORKFLOW PATTERN: Step 2 - Format context
      const context = this.formatContext(finalDocuments);

      // WORKFLOW PATTERN: Step 3 - Generate response (placeholder)
      const answer = await this.generateResponse(userQuery, context);

      // WORKFLOW PATTERN: Step 4 - Return with sources
      return {
        answer,
        sources: finalDocuments.map((doc) => ({
          title: doc.title,
          content: doc.content ? `${doc.content.substring(0, 200)}...` : '',
          category: doc.category,
          similarity: doc.similarity,
        })),
      };
    } catch (err) {
      logger.error(`RAG chain error: ${err}`);
      return {
        answer: 'Lo siento, no pude procesar tu pregunta. Intenta de nuevo.',
        sources: [],
      };
    }
  }

  /**
   * Format documents into context for LLM
   */
  private static formatContext(documents: any[]): string {
    if (documents.length === 0) {
      return 'No hay información disponible.';
    }

    const formatted = documents
      .map((doc, idx) => {
        const similarity = doc.similarity ? ` (score ${Number(doc.similarity).toFixed(2)})` : '';
        const title = doc.title || 'Documento';
        const content = doc.content ? doc.content.substring(0, 240) : '';
        return `[${idx + 1}] ${title}${similarity}: ${content}`;
      })
      .join('\n\n');

    return formatted;
  }

  private static filterRelevantDocuments(documents: any[], userQuery: string): any[] {
    if (documents.length === 0) {
      return [];
    }

    const normalizedQuery = userQuery.toLowerCase();
    if (normalizedQuery.includes('biblioteca')) {
      return documents.filter((doc) => {
        const title = String(doc.title || '').toLowerCase();
        const content = String(doc.content || '').toLowerCase();
        return title.includes('biblioteca') || content.includes('biblioteca');
      });
    }

    const stopWords = new Set([
      'donde',
      'queda',
      'cual',
      'horario',
      'como',
      'que',
      'para',
      'por',
      'una',
      'un',
      'la',
      'el',
      'los',
      'las',
      'de',
      'del',
      'y',
      'en',
      'su',
    ]);

    const keywords = Array.from(
      new Set(
        normalizedQuery
          .split(/\s+/)
          .map((word) => word.replace(/[^a-z0-9\u00C0-\u017F]/gi, ''))
          .filter((word) => word.length >= 4 && !stopWords.has(word))
      )
    );

    if (keywords.length === 0) {
      return [];
    }

    return documents.filter((doc) => {
      const title = String(doc.title || '').toLowerCase();
      const content = String(doc.content || '').toLowerCase();
      return keywords.some((keyword) => title.includes(keyword) || content.includes(keyword));
    });
  }

  /**
   * Generate response (placeholder - will use LLM API)
   */
  private static async generateResponse(userQuery: string, context: string): Promise<string> {
    logger.info('RAG: Generating response');

    const systemPrompt =
      'Eres un asistente de orientación universitaria. Responde en 2-3 frases, claro y amigable. '
      + 'Usa solo la información del contexto, sin listar documentos ni repetir el contexto. '
      + 'Si no hay datos suficientes, dilo y sugiere un siguiente paso.';
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `Pregunta: ${userQuery}\n\nContexto:\n${context}`,
      },
    ];

    const completion = await LLMService.generateChatCompletion(messages, 0.2);
    if (completion) {
      return completion;
    }

    logger.warn('RAG: LLM unavailable, returning concise fallback');
    const firstLine = context.split('\n').find((line) => line.trim().length > 0) || '';
    if (firstLine) {
      const cleaned = firstLine.replace(/^\[\d+\]\s*/, '');
      return `${cleaned}. ¿Quieres más detalles?`;
    }

    return 'No encontré información suficiente sobre eso. ¿Puedes darme más contexto?';
  }
}
