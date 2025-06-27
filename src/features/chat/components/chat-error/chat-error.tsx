import ChatHeader from "../chat-header/chat-header";
import ChatIconContent from "../chat-icon-content/chat-icon-content";
import styles from "./chat-error.module.css";

interface ChatErrorProps {
  name: string;
}

export default function ChatError({ name }: ChatErrorProps) {
  return (
    <div className={styles.container}>
      <ChatHeader name={name} />
      <ChatIconContent
        icon="⚠️"
        title="Error loading messages"
        message="Please try refreshing the page."
      />
    </div>
  );
}
