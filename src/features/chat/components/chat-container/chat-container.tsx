"use client";

import type { Message } from "generated/gql/graphql";
import { useChatScroll } from "~/features/chat/hooks/use-chat-scroll";
import ChatHeader from "../chat-header/chat-header";
import ChatMessagesList from "../chat-messages-list/chat-messages-list";
import MessageInput from "../message-input/message-input";
import styles from "./chat-container.module.css";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  name: string;
  onSendMessage: (text: string) => void;
  loading?: boolean;
  error?: boolean;
  hasNextPage?: boolean;
  onLoadMore: () => void;
}

export default function ChatContainer({
  name,
  messages,
  currentUserId,
  onSendMessage,
  loading,
  hasNextPage,
  onLoadMore,
}: ChatContainerProps) {
  const { messagesEndRef, messagesContainerRef } = useChatScroll({
    messages,
    hasNextPage,
    loading,
    onLoadMore,
  });

  const orderedMessages = [...messages].reverse();

  return (
    <div className={styles.container}>
      <ChatHeader name={name} />
      <div className={styles.messages} ref={messagesContainerRef}>
        {loading && <div className={styles.loading}>Loading...</div>}
        <ChatMessagesList
          messages={orderedMessages}
          currentUserId={currentUserId}
        />
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
