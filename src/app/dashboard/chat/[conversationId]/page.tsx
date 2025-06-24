"use client";

import { useParams } from "next/navigation";
import { useConversationPage } from "~/features/chat/hooks/use-conversation-page";
import ChatContainer from "~/features/chat/components/chat-container/chat-container";
import ChatError from "~/features/chat/components/chat-error/chat-error";
import ChatLoading from "~/features/chat/components/chat-loading/chat-loading";

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const {
    userName,
    messages,
    loading,
    error,
    onSendMessage,
    onLoadMore,
    hasNextPage,
    currentUserId,
    messagesFetching,
  } = useConversationPage(conversationId);

  if (error) {
    return <ChatError name={userName} />;
  }

  if (loading || !messages) {
    return <ChatLoading />;
  }

  return (
    <ChatContainer
      name={userName}
      messages={messages.edges.map((e) => e.node)}
      hasNextPage={hasNextPage}
      currentUserId={currentUserId}
      onSendMessage={onSendMessage}
      loading={messagesFetching}
      onLoadMore={onLoadMore}
    />
  );
}
