import { z } from "zod";

export const GroupMessageSchema = z.object({
  id: z.string().min(1),
  sender_id: z.string().min(1),
  sender_name: z.string().min(1),
  sender_avatar: z.string().nullable(),
  content: z.string().min(1),
  created_at: z.string().min(1),
});

export const GroupMessagesSchema = z.array(GroupMessageSchema);

export const SendGroupMessageInputSchema = z.object({
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  senderAvatar: z.string().nullable(),
  content: z.string().trim().min(1),
});

export type GroupMessage = z.infer<typeof GroupMessageSchema>;
export type SendGroupMessageInput = z.infer<typeof SendGroupMessageInputSchema>;
