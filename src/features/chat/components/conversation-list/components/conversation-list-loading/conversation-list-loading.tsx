"use client";

import styles from "./conversation-list-loading.module.css";

export default function ConversationListLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Conversations</h2>
      </div>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⏳</div>
        <div className={styles.emptyTitle}>Loading conversations...</div>
      </div>
    </div>
  );
}
