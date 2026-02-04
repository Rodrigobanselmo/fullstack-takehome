"use client";

import { useRef, useEffect, type FormEvent } from "react";
import { useAIChat } from "../context/ai-chat-context";
import { useAIChatStream } from "../hooks/use-ai-chat-stream";
import styles from "./ai-chat-sidebar.module.css";

export function AIChatSidebar() {
  const { isOpen, close } = useAIChat();
  const { messages, isLoading, error, sendMessage, clearMessages } =
    useAIChatStream();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim()) return;

    void sendMessage(input.value);
    input.value = "";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        onClick={close}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            <span>🤖</span>
            AI Assistant
          </h2>
          <div className={styles.headerActions}>
            <button
              className={styles.iconButton}
              onClick={clearMessages}
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              className={styles.iconButton}
              onClick={close}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💬</div>
              <p>Start a conversation with the AI assistant</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.role === "user"
                    ? styles.messageUser
                    : styles.messageAssistant
                }`}
              >
                {msg.content || (isLoading && index === messages.length - 1 ? "..." : "")}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Input */}
        <form className={styles.inputContainer} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

