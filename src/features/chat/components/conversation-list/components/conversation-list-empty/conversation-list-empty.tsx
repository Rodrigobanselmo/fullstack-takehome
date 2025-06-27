"use client";

import styles from "./conversation-list-empty.module.css";

export default function ConversationListEmpty() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Conversations</h2>
      </div>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💬</div>
        <div className={styles.emptyTitle}>No conversations yet</div>
        <div className={styles.emptyMessage}>
          Start a conversation with someone to see it here.
        </div>
      </div>
    </div>
  );
}
