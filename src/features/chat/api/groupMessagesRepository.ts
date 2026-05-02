import { supabase } from "@/integrations/supabase/client";
import { GroupMessageSchema, GroupMessagesSchema, SendGroupMessageInputSchema } from "../schemas";
import type { GroupMessage, SendGroupMessageInput } from "../types";

const GROUP_MESSAGES_PAGE_SIZE = 50;

export interface GroupMessagesPage {
  messages: GroupMessage[];
  nextCursor: string | null;
}

export async function listGroupMessagesPage(cursor?: string): Promise<GroupMessagesPage> {
  let query = supabase
    .from("group_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(GROUP_MESSAGES_PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  const newestFirst = GroupMessagesSchema.parse(data ?? []);
  const messages = [...newestFirst].reverse();
  const nextCursor = newestFirst.length === GROUP_MESSAGES_PAGE_SIZE
    ? newestFirst[newestFirst.length - 1].created_at
    : null;

  return { messages, nextCursor };
}

export async function sendGroupMessage(input: SendGroupMessageInput) {
  const message = SendGroupMessageInputSchema.parse(input);
  const { error } = await supabase.from("group_messages").insert({
    sender_id: message.senderId,
    sender_name: message.senderName,
    sender_avatar: message.senderAvatar,
    content: message.content,
  });

  if (error) throw error;
}

export function subscribeToGroupMessages(onInsert: (message: GroupMessage) => void) {
  return supabase
    .channel("group_messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "group_messages" },
      (payload) => onInsert(GroupMessageSchema.parse(payload.new)),
    )
    .subscribe();
}

export function removeGroupMessagesSubscription(channel: ReturnType<typeof subscribeToGroupMessages>) {
  return supabase.removeChannel(channel);
}
