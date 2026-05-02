import { Router, Request, Response } from 'express';
import logger from '@/config/logger';
import { ChatService } from '@/services/chat.service';
import { RAGChainService } from '@/services/rag.service';
import { requireAuth } from '@/middleware/auth';
import { ValidationError } from '@/middleware/errorHandler';

const router = Router();

/**
 * POST /api/chat/message
 * Send a chat message (protected)
 * Request body: { message: string }
 */
router.post('/message', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User ID required');
    }

    if (!message || message.trim().length === 0) {
      throw new ValidationError('Message cannot be empty');
    }

    logger.info(`Chat: User ${userId} sending message`);

    // Store user message
    const storedMessage = await ChatService.storeMessage(userId, message.trim());

    const ragResult = await RAGChainService.queryRAG(message, userId);
    const response = ragResult.answer;

    // Update with response
    const updatedMessage = await ChatService.updateMessageResponse(
      storedMessage.id,
      response,
      ragResult.sources
    );

    res.status(201).json({
      id: updatedMessage.id,
      message: updatedMessage.message,
      response: updatedMessage.response,
      sources: updatedMessage.response_sources || ragResult.sources,
      timestamp: updatedMessage.created_at,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/history
 * Get chat history for user (protected)
 * Query params: limit=50 (default)
 */
router.get('/history', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user?.id;
    let limitParam = req.query.limit;
    if (Array.isArray(limitParam)) limitParam = limitParam[0];
    const limit = Math.min(parseInt(limitParam as string) || 50, 500);

    if (!userId) {
      throw new ValidationError('User ID required');
    }

    logger.info(`Chat: Fetching history for user ${userId}`);

    const messages = await ChatService.getChatHistory(userId, limit);

    res.json({
      count: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        message: m.message,
        response: m.response,
        sources: m.response_sources || [],
        timestamp: m.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/chat/:messageId
 * Delete a chat message (protected)
 */
router.delete('/:messageId', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const messageId = Array.isArray(req.params.messageId) ? req.params.messageId[0] : req.params.messageId;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User ID required');
    }

    logger.info(`Chat: User ${userId} deleting message ${messageId}`);

    await ChatService.deleteMessage(messageId, userId);

    res.json({
      message: 'Message deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/chat/clear
 * Clear all chat history for user (protected)
 */
router.delete('/clear/all', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User ID required');
    }

    logger.info(`Chat: User ${userId} clearing all messages`);

    await ChatService.clearChatHistory(userId);

    res.json({
      message: 'Chat history cleared successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/test-rag
 * Test RAG pipeline without auth (development only)
 */
router.post('/test-rag', async (req: Request, res: Response, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      throw new ValidationError('Message cannot be empty');
    }
    logger.info(`RAG Test: "${message}"`);
    const ragResult = await RAGChainService.queryRAG(message, 'test-user');
    res.json({
      query: message,
      answer: ragResult.answer,
      sources: ragResult.sources,
      sourcesCount: ragResult.sources.length,
      tokens: ragResult.tokens,
      model: ragResult.model,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
