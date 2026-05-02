CREATE INDEX IF NOT EXISTS idx_group_messages_created_at
  ON public.group_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id
  ON public.group_messages(sender_id);
