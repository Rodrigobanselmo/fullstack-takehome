import ChatHeader from "../chat-header/chat-header";
import ChatIconContent from "../chat-icon-content/chat-icon-content";
import styles from "./chat-error.module.css";

interface ChatErrorProps {
  userName: string;
}

export default function ChatError({ userName }: ChatErrorProps) {
  return (
    <div className={styles.container}>
      <ChatHeader userName={userName} />
      <ChatIconContent
        icon="⚠️"
        title="Error loading messages"
        message="Please try refreshing the page."
      />
    </div>
  );
}
