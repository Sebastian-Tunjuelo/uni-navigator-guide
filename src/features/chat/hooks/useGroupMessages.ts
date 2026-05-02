import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import {
  type GroupMessagesPage,
  listGroupMessagesPage,
  removeGroupMessagesSubscription,
  sendGroupMessage,
  subscribeToGroupMessages,
} from "../api/groupMessagesRepository";
import type { GroupMessage, SendGroupMessageInput } from "../types";

const groupMessagesKey = ["group-messages"] as const;

function flattenPages(data: InfiniteData<GroupMessagesPage> | undefined) {
  return [...(data?.pages ?? [])]
    .reverse()
    .flatMap((page) => page.messages);
}

export function useGroupMessages() {
  const queryClient = useQueryClient();

  const messagesQuery = useInfiniteQuery({
    queryKey: groupMessagesKey,
    queryFn: ({ pageParam }) => listGroupMessagesPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const sendMutation = useMutation({
    mutationFn: (input: SendGroupMessageInput) => sendGroupMessage(input),
  });

  useEffect(() => {
    const channel = subscribeToGroupMessages((message) => {
      queryClient.setQueryData<InfiniteData<GroupMessagesPage>>(groupMessagesKey, (current) => {
        if (!current) return current;
        if (current.pages.some((page) => page.messages.some((item) => item.id === message.id))) {
          return current;
        }

        const [latestPage, ...rest] = current.pages;
        return {
          ...current,
          pages: [
            {
              ...latestPage,
              messages: [...latestPage.messages, message],
            },
            ...rest,
          ],
        };
      });
    });

    return () => {
      removeGroupMessagesSubscription(channel);
    };
  }, [queryClient]);

  return {
    messages: flattenPages(messagesQuery.data),
    isLoading: messagesQuery.isLoading,
    fetchOlderMessages: messagesQuery.fetchNextPage,
    hasOlderMessages: messagesQuery.hasNextPage,
    isFetchingOlderMessages: messagesQuery.isFetchingNextPage,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
