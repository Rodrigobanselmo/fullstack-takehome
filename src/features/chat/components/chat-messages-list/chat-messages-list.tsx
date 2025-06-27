import MessageComponent from "../message/message";
import ChatIconContent from "../chat-icon-content/chat-icon-content";
import type { Message } from "generated/gql/graphql";

interface ChatMessagesListProps {
  messages: Message[];
  currentUserId: string;
}

export default function ChatMessagesList({
  messages,
  currentUserId,
}: ChatMessagesListProps) {
  const isEmpty = messages.length === 0;
  if (isEmpty) {
    return (
      <ChatIconContent
        icon="💬"
        title="No messages yet"
        message="Start the conversation by sending a message!"
      />
    );
  }

  return (
    <>
      {messages.map((message) => (
        <MessageComponent
          key={message.id}
          message={message}
          isOwnMessage={message.sender.id === currentUserId}
        />
      ))}
    </>
  );
}
