"use client";

import { useEffect, useRef } from "react";
import MessageInput from "../message-input/message-input";
import styles from "./chat-container.module.css";
import type { Message } from "generated/gql/graphql";
import ChatLoading from "../chat-loading/chat-loading";
import ChatHeader from "../chat-header/chat-header";
import ChatError from "../chat-error/chat-error";
import ChatMessagesList from "../chat-messages-list/chat-messages-list";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  userName: string;
  onSendMessage: (text: string) => void;
  loading?: boolean;
  error?: boolean;
}

export default function ChatContainer({
  messages,
  currentUserId,
  userName,
  onSendMessage,
  loading,
  error,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <ChatError userName={userName} />;
  }

  const isInitialLoading = loading && messages.length === 0;
  if (isInitialLoading) {
    return <ChatLoading />;
  }

  return (
    <div className={styles.container}>
      <ChatHeader userName={userName} />

      <div className={styles.messages}>
        <ChatMessagesList messages={messages} currentUserId={currentUserId} />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  );
}
