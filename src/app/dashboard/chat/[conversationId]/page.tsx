"use client";

import { useParams } from "next/navigation";
import { useUser } from "~/context/user-context";
import { useQueryMessages } from "~/features/chat/api/use-query-messages";
import { useSendMessageMutation } from "~/features/chat/api/use-send-message-mutation";
import ChatContainer from "~/features/chat/components/chat-container/chat-container";
import { useQueryConversation } from "~/features/chat/api/use-query-conversation";

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const user = useUser();
  const currentUserId = user.id;

  const {
    data: conversationData,
    loading: conversationLoading,
    error: conversationError,
  } = useQueryConversation(conversationId);

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQueryMessages(conversationId);

  const [sendMessage] = useSendMessageMutation();

  const handleSendMessage = async (text: string) => {
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
  };

  const conversation = conversationData?.conversation;

  const userName = conversation
    ? conversation.contractor.id === currentUserId
      ? conversation.homeowner.name
      : conversation.contractor.name
    : "Conversation";

  return (
    <ChatContainer
      messages={messagesData?.messages.edges.map((e) => e.node) || []}
      currentUserId={currentUserId}
      userName={userName}
      onSendMessage={handleSendMessage}
      loading={messagesLoading || conversationLoading}
      error={!!messagesError || !!conversationError}
    />
  );
}
