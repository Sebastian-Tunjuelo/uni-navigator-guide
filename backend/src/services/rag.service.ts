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
    tokens: { prompt: number; completion: number; total: number } | null;
    model: string | null;
  }> {
    logger.info(`RAG: Processing query for user ${userId}: "${userQuery}"`);

    try {
      const documents = await RetrieverService.hybridSearch(userQuery, 3);
      const relevantDocuments = this.filterRelevantDocuments(documents, userQuery);
      const finalDocuments = relevantDocuments.length > 0 ? relevantDocuments : [];
      logger.info(`RAG: Retrieved ${finalDocuments.length} relevant documents`);

      const context = this.formatContext(finalDocuments);
      const { answer, tokens, model } = await this.generateResponse(userQuery, context);

      return {
        answer,
        tokens,
        model,
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
        tokens: null,
        model: null,
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

    const normalizedQuery = userQuery.toLowerCase().trim();

    // Detectar conversación casual — no buscar documentos
    const casualPhrases = [
      'hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hi',
      'gracias', 'muchas gracias', 'ok', 'okay', 'perfecto', 'genial', 'excelente',
      'entendido', 'de acuerdo', 'claro', 'sí', 'no', 'bye', 'adiós', 'chao',
      'eres muy útil', 'eres genial', 'me ayudaste', 'qué bueno',
    ];
    if (casualPhrases.some(p => normalizedQuery.includes(p)) && normalizedQuery.length < 40) {
      return [];
    }

    if (normalizedQuery.includes('biblioteca')) {
      return documents.filter((doc) => {
        const title = String(doc.title || '').toLowerCase();
        const content = String(doc.content || '').toLowerCase();
        return title.includes('biblioteca') || content.includes('biblioteca');
      });
    }

    const stopWords = new Set([
      'donde', 'queda', 'cual', 'horario', 'como', 'que', 'para', 'por',
      'una', 'un', 'la', 'el', 'los', 'las', 'de', 'del', 'y', 'en', 'su',
      'puedo', 'puedes', 'hay', 'tiene', 'tengo', 'necesito', 'quiero',
      'favor', 'porfavor', 'ayuda', 'info', 'informacion',
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
   * Generate response using LLM with smart context handling
   */
  private static async generateResponse(
    userQuery: string,
    context: string
  ): Promise<{ answer: string; tokens: { prompt: number; completion: number; total: number } | null; model: string | null }> {
    logger.info('RAG: Generating response');

    const hasContext = context !== 'No hay información disponible.';

    const systemPrompt = `Eres UniBot, el asistente virtual de orientación universitaria para estudiantes de primer semestre.
Tu personalidad: cálido, cercano, empático y útil — como un compañero mayor que ya conoce el campus.
Responde SIEMPRE en español, de forma natural y conversacional.

REGLAS según el tipo de mensaje:

1. SALUDOS / CONVERSACIÓN CASUAL (hola, gracias, cómo estás, etc.):
   → Responde de forma amigable y natural. Ofrece ayuda con el campus.

2. PREGUNTAS SOBRE EL CAMPUS con contexto disponible:
   → Usa la información del contexto para responder en 2-3 frases claras y directas.
   → No repitas el contexto textualmente ni menciones "documentos".

3. PREGUNTAS SOBRE EL CAMPUS sin contexto disponible:
   → Admite que no tienes esa información específica.
   → Sugiere alternativas concretas: secretaría, bienestar, portal estudiantil, etc.

4. PREGUNTAS FUERA DEL CAMPUS (comida, agua, clima, temas personales, etc.):
   → Reconoce brevemente la pregunta con humor o empatía.
   → Redirige amablemente hacia lo que sí puedes ayudar del campus.
   → Ejemplo: si piden agua → menciona dónde hay dispensadores o cafetería.

5. NUNCA respondas con listas de documentos, IDs, ni repitas el contexto crudo.`;

    const userContent = hasContext
      ? `Mensaje del estudiante: "${userQuery}"\n\nInformación relevante del campus:\n${context}`
      : `Mensaje del estudiante: "${userQuery}"`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userContent },
    ];

    const result = await LLMService.generateChatCompletion(messages, 0.5);
    if (result) {
      logger.info(`RAG: Tokens used — prompt: ${result.tokens?.prompt}, completion: ${result.tokens?.completion}, total: ${result.tokens?.total}`);
      return { answer: result.content, tokens: result.tokens, model: result.model };
    }

    // Fallback sin LLM — respuesta contextual según el tipo de pregunta
    logger.warn('RAG: LLM unavailable, returning contextual fallback');
    if (hasContext) {
      const firstLine = context.split('\n').find((line) => line.trim().length > 0) || '';
      const cleaned = firstLine.replace(/^\[\d+\]\s*[^:]+:\s*/, '');
      return {
        answer: cleaned ? `${cleaned.substring(0, 200)}...` : 'No encontré información específica sobre eso. Puedes consultar en secretaría o bienestar universitario.',
        tokens: null,
        model: null,
      };
    }

    const q = userQuery.toLowerCase();
    let answer: string;
    if (/agua|sed|beber|tomar/.test(q)) {
      answer = 'Para agua, puedes ir a la **Cafetería Principal** o a los dispensadores en los pasillos de cada bloque. 💧';
    } else if (/hambre|comer|almuerzo|comida|cafeteria|cafetería/.test(q)) {
      answer = 'La **Cafetería Principal** está cerca de la plaza central, abierta de 7:00 a 19:00 con menú estudiantil. 🍽️';
    } else if (/perdido|perdida|donde|dónde|ubicacion|ubicación|llegar/.test(q)) {
      answer = 'Usa la pestaña **Mapa** de la app para orientarte. También puedes preguntarme por cualquier edificio o servicio específico. 🗺️';
    } else if (/ansioso|ansiosa|estres|estrés|nervioso|nerviosa|triste|mal|agobiado/.test(q)) {
      answer = 'Entiendo que el primer semestre puede ser intenso. 💙 El **Centro de Bienestar Estudiantil** (Bloque B, piso 2) ofrece apoyo psicológico gratuito — puedes acercarte sin cita previa.';
    } else if (/hola|buenos|buenas|hey|qué tal|como estas|cómo estás/.test(q)) {
      answer = '¡Hola! 👋 Estoy aquí para ayudarte con todo lo del campus. Pregúntame sobre horarios, ubicaciones, trámites o servicios.';
    } else if (/gracias|thank|perfecto|genial|excelente/.test(q)) {
      answer = '¡Con gusto! 😊 Si necesitas algo más sobre el campus, aquí estoy.';
    } else {
      answer = 'Esa pregunta está un poco fuera de mi área, pero puedo ayudarte con todo lo relacionado al campus: horarios, ubicaciones, trámites y servicios universitarios. ¿Qué necesitas?';
    }

    return { answer, tokens: null, model: null };
  }
}
