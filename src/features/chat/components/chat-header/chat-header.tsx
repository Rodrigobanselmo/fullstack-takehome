import { getNameInitials } from "../../utils/get-name-initials";
import styles from "./chat-header.module.css";

interface ChatHeaderProps {
  userName: string;
}

export default function ChatHeader({ userName }: ChatHeaderProps) {
  const initials = getNameInitials(userName);
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>{initials}</div>
      <h1 className={styles.title}>{userName}</h1>
    </div>
  );
}
