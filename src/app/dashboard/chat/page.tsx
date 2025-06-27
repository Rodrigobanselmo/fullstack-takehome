import ChatIconContent from "~/features/chat/components/chat-icon-content/chat-icon-content";
import styles from "./page.module.css";

export default function ChatPage() {
  return (
    <div className={styles.container}>
      <ChatIconContent
        icon="💬"
        title="Select a conversation"
        message="Choose a conversation from the list to start chatting"
      />
    </div>
  );
}
