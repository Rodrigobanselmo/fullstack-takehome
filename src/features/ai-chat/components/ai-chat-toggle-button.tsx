"use client";

import { useAIChat } from "../context/ai-chat-context";
import styles from "./ai-chat-toggle-button.module.css";

export function AIChatToggleButton() {
  const { toggle, isOpen } = useAIChat();

  return (
    <button
      className={`${styles.button} ${isOpen ? styles.buttonActive : ""}`}
      onClick={toggle}
      title="AI Assistant"
      aria-label="Toggle AI Assistant"
    >
      🤖
    </button>
  );
}
