"use client";

import { useRef, useEffect } from "react";
import { useAIChat } from "../context/ai-chat-context";
import { useAIChatStream } from "../hooks/use-ai-chat-stream";
import {
  useQueryAIThreads,
  useQueryAIThreadMessages,
} from "../api/ai-thread.queries";
import {
  useCreateAIThreadMutation,
  useDeleteAIThreadMutation,
} from "../api/ai-thread.mutations";
import styles from "./ai-chat-sidebar.module.css";

export function AIChatSidebar() {
  const {
    isOpen,
    close,
    currentThreadId,
    setCurrentThreadId,
    showThreadList,
    toggleThreadList,
  } = useAIChat();

  const { data: threadsData, loading: threadsLoading } = useQueryAIThreads();
  const { data: messagesData } = useQueryAIThreadMessages(currentThreadId);
  const [createThread] = useCreateAIThreadMutation();
  const [deleteThread] = useDeleteAIThreadMutation();

  const {
    messages: streamMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
  } = useAIChatStream();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track previous thread to detect thread changes
  const prevThreadIdRef = useRef<string | null>(null);

  // Clear messages when thread changes (separate effect to avoid race conditions)
  useEffect(() => {
    if (
      prevThreadIdRef.current !== null &&
      prevThreadIdRef.current !== currentThreadId
    ) {
      // Thread changed - clear messages immediately
      clearMessages();
    }
    prevThreadIdRef.current = currentThreadId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThreadId]);

  // Sync messages from GraphQL when data arrives
  useEffect(() => {
    if (isLoading) return; // Don't overwrite while streaming

    if (
      messagesData?.aiThreadMessages &&
      messagesData.aiThreadMessages.length > 0
    ) {
      const mapped = messagesData.aiThreadMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData, isLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamMessages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCreateThread = async () => {
    const result = await createThread({
      variables: { input: { title: "New Chat" } },
    });
    if (result.data?.createAIThread) {
      setCurrentThreadId(result.data.createAIThread.id);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteThread({ variables: { id: threadId } });
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim()) return;

    const messageText = input.value;
    input.value = "";

    // If no thread selected, create one first
    let threadIdToUse = currentThreadId;
    if (!threadIdToUse) {
      const result = await createThread({
        variables: { input: { title: messageText.slice(0, 50) } },
      });
      if (result.data?.createAIThread) {
        threadIdToUse = result.data.createAIThread.id;
        setCurrentThreadId(threadIdToUse);
      }
    }

    void sendMessage(messageText, threadIdToUse);
  };

  const threads = threadsData?.aiThreads ?? [];

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        onClick={close}
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.iconButton}
              onClick={toggleThreadList}
              title="Toggle threads"
            >
              ☰
            </button>
            <h2 className={styles.headerTitle}>
              <span>🤖</span>
              AI Assistant
            </h2>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.iconButton}
              onClick={handleCreateThread}
              title="New chat"
            >
              ➕
            </button>
            <button className={styles.iconButton} onClick={close} title="Close">
              ✕
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Thread List */}
          {showThreadList && (
            <div className={styles.threadList}>
              <div className={styles.threadListHeader}>
                <span>Conversations</span>
              </div>
              {threadsLoading ? (
                <div className={styles.threadListLoading}>Loading...</div>
              ) : threads.length === 0 ? (
                <div className={styles.threadListEmpty}>No conversations</div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`${styles.threadItem} ${
                      thread.id === currentThreadId
                        ? styles.threadItemActive
                        : ""
                    }`}
                    onClick={() => handleSelectThread(thread.id)}
                  >
                    <span className={styles.threadTitle}>{thread.title}</span>
                    <button
                      className={styles.threadDeleteBtn}
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages}>
            {streamMessages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>💬</div>
                <p>Start a conversation with the AI assistant</p>
              </div>
            ) : (
              streamMessages.map((msg, index) => {
                // Tool messages have special styling
                if (msg.role === "tool") {
                  return (
                    <div
                      key={index}
                      className={`${styles.toolMessage} ${
                        msg.toolStatus === "running"
                          ? styles.toolRunning
                          : msg.toolStatus === "success"
                            ? styles.toolSuccess
                            : styles.toolError
                      }`}
                    >
                      {msg.toolStatus === "running" && (
                        <span className={styles.toolSpinner}>⏳</span>
                      )}
                      {msg.content}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      msg.role === "user"
                        ? styles.messageUser
                        : styles.messageAssistant
                    }`}
                  >
                    {msg.content ||
                      (isLoading && index === streamMessages.length - 1
                        ? "..."
                        : "")}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
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
