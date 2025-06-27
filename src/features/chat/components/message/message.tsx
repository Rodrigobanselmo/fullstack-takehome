import type { Message } from "generated/gql/graphql";
import styles from "./message.module.css";

interface MessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageComponent({
  message,
  isOwnMessage,
}: MessageProps) {
  const messageClass = isOwnMessage ? styles.sent : styles.received;
  const initials = message.sender.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={`${styles.message} ${messageClass}`}>
      <div className={styles.avatar}>{initials}</div>
      <div className={styles.content}>
        <div className={styles.bubble}>{message.text}</div>
        <div className={styles.meta}>{formatDate(message.createdAt)}</div>
      </div>
    </div>
  );
}
