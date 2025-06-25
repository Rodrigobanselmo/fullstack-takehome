import { useCallback } from "react";
import { useUser } from "~/context/user-context";
import { useQueryConversation } from "../api/use-query-conversation";
import { useQueryMessages } from "../api/use-query-messages";
import { useSendMessageMutation } from "../api/use-send-message-mutation";
import { extractConversationUserName } from "../utils/extract-conversation-user-name";

export function useConversationPage(conversationId: string) {
  const { id: currentUserId } = useUser();

  const {
    data: conversationData,
    loading: conversationLoading,
    error: conversationError,
  } = useQueryConversation(conversationId);

  const {
    data: messagesData,
    isLoadingFirstPage: messagesLoading,
    isFetching: messagesFetching,
    error: messagesError,
    loadMore,
    refetch: refetchMessages,
  } = useQueryMessages(conversationId);

  const [sendMessage] = useSendMessageMutation();

  const conversation = conversationData?.conversation;
  const messages = messagesData?.messages;

  const userName = extractConversationUserName(currentUserId, conversation);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) return;
      await sendMessage({
        variables: {
          input: {
            conversationId,
            text,
          },
        },
      });
      void refetchMessages();
    },
    [conversationId, sendMessage, refetchMessages],
  );

  return {
    conversation,
    messages,
    userName,
    loading: (messagesLoading || conversationLoading) && !messages,
    error: messagesError || conversationError,
    onSendMessage: handleSendMessage,
    onLoadMore: loadMore,
    hasNextPage: messages?.pageInfo.hasNextPage ?? false,
    messagesFetching,
    currentUserId,
  };
}
