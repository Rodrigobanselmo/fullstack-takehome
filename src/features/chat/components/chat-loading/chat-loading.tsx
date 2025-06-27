import styles from "./chat-loading.module.css";

export default function ChatLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>⏳</div>
      <div className={styles.title}>Loading messages...</div>
    </div>
  );
}
