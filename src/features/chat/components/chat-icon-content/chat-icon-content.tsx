"use client";

import styles from "./chat-icon-content.module.css";

interface ChatIconContentProps {
  icon: string;
  title: string;
  message?: string;
}

export default function ChatIconContent({
  icon,
  title,
  message,
}: ChatIconContentProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
