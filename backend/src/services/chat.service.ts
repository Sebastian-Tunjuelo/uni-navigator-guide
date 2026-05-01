import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { ChatMessage } from '@/types/chat';

export class ChatService {
  /**
   * Store user message and generate response (placeholder)
   * This will be replaced with RAG chain in FASE 5
   */
  static async storeMessage(
    userId: string,
    message: string
  ): Promise<ChatMessage> {
    logger.info(`Chat: User ${userId} sent message`);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        response: null,
        model_used: 'placeholder',
      })
      .select()
      .single();

    if (error) {
      logger.error(`Chat storage error: ${error.message}`);
      throw new Error(`Failed to store message: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to store message: No data returned');
    }

    logger.info(`Chat: Message ${data.id} stored successfully`);
    return data;
  }

  /**
   * Update message with response
   */
  static async updateMessageResponse(
    messageId: string,
    response: string,
    sources?: any[]
  ): Promise<ChatMessage> {
    logger.info(`Chat: Updating message ${messageId} with response`);

    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        response,
        response_sources: sources || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      logger.error(`Chat update error: ${error.message}`);
      throw new Error(`Failed to update message: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update message: No data returned');
    }

    return data;
  }

  /**
   * Get chat history for user
   */
  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    logger.info(`Chat: Fetching history for user ${userId}`);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`Chat history error: ${error.message}`);
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete message
   */
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    logger.info(`Chat: Deleting message ${messageId}`);

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      logger.error(`Chat delete error: ${error.message}`);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Clear all messages for user
   */
  static async clearChatHistory(userId: string): Promise<void> {
    logger.info(`Chat: Clearing history for user ${userId}`);

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      logger.error(`Chat clear error: ${error.message}`);
      throw new Error(`Failed to clear chat history: ${error.message}`);
    }
  }
}
