"use client";

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import Image from "next/image";
import { NetworkStatus } from "@apollo/client";
import {
  X,
  History,
  HelpCircle,
  MessageSquare,
  Plus,
  User,
  Loader2,
  Paperclip,
  Mic,
  ArrowUp,
  ChevronDown,
  Square,
} from "lucide-react";
import {
  useAIChat,
  PANEL_MIN_WIDTH,
  PANEL_MAX_WIDTH,
} from "../context/ai-chat-context";
import { useAIChatStream, type ChatMessage } from "../hooks/use-ai-chat-stream";
import { type AIMode, AI_MODE_LABELS, DEFAULT_AI_MODE } from "~/lib/ai-types";
import { useQueryAIThreadMessages } from "../api/ai-thread.queries";
import { useCreateAIThreadMutation } from "../api/ai-thread.mutations";
import {
  formatRelativeTime,
  formatFullDateTime,
  getDateLabel,
  shouldShowDateSeparator,
} from "../utils/format-time";
import { ThreadHistory } from "./thread-history";
import styles from "./ai-chat-sidebar.module.css";

export function AIChatSidebar() {
  const {
    isOpen,
    close,
    currentThreadId,
    setCurrentThreadId,
    panelWidth,
    setPanelWidth,
  } = useAIChat();

  const [showHistory, setShowHistory] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>(DEFAULT_AI_MODE);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const {
    data: messagesData,
    fetchMore,
    networkStatus,
  } = useQueryAIThreadMessages(currentThreadId);
  const [createThread] = useCreateAIThreadMutation();

  const {
    messages: streamMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
    interrupt,
  } = useAIChatStream();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasInput, setHasInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const shouldScrollOnNextUpdate = useRef(false);
  const pendingScrollAction = useRef<
    | { type: "initial" }
    | { type: "restore"; prevScrollHeight: number; prevScrollTop: number }
    | null
  >({ type: "initial" });
  const isLoadingMoreRef = useRef(false);

  // Pagination state
  const isLoadingMore = networkStatus === NetworkStatus.fetchMore;
  const dbMessages =
    messagesData?.aiThreadMessages.edges.map((e) => e.node) ?? [];
  const hasMoreMessages =
    messagesData?.aiThreadMessages.pageInfo.hasNextPage ?? false;
  const endCursor =
    messagesData?.aiThreadMessages.pageInfo.endCursor ?? null;

  // Track previous thread to detect thread changes
  const prevThreadIdRef = useRef<string | null>(null);

  // Clear messages when thread changes (separate effect to avoid race conditions)
  useEffect(() => {
    if (
      prevThreadIdRef.current !== null &&
      prevThreadIdRef.current !== currentThreadId
    ) {
      // Thread changed - clear messages immediately and mark as initial load
      clearMessages();
      pendingScrollAction.current = { type: "initial" };
    }
    prevThreadIdRef.current = currentThreadId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThreadId]);

  // Close mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modeDropdownRef.current &&
        !modeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModeDropdown(false);
      }
    };

    if (showModeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModeDropdown]);

  // Sync messages from GraphQL when data arrives
  // Sync on: initial load (empty state) or pagination (isLoadingMoreRef)
  // Don't sync: while streaming or right after streaming (messages are already correct)
  useEffect(() => {
    // Don't overwrite while streaming
    if (isLoading) return;

    // If we're loading more (pagination), always sync to get the merged messages
    if (isLoadingMoreRef.current) {
      isLoadingMoreRef.current = false;
      if (dbMessages.length > 0) {
        const mapped = dbMessages.map((m) => ({
          role: m.role as "user" | "assistant" | "tool",
          content: m.content,
          toolName: m.toolName ?? undefined,
          toolStatus: (m.toolStatus as "running" | "success" | "error") ?? undefined,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(mapped);
      }
      return;
    }

    // Only sync from DB on initial load (empty state)
    // Don't overwrite if we already have messages from streaming
    if (streamMessages.length > 0) return;

    if (dbMessages.length > 0) {
      const mapped = dbMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "tool",
        content: m.content,
        toolName: m.toolName ?? undefined,
        toolStatus: (m.toolStatus as "running" | "success" | "error") ?? undefined,
        timestamp: new Date(m.createdAt),
      }));
      setMessages(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData, isLoading]);

  // Handle scroll position restoration synchronously after DOM updates
  // This depends on streamMessages (rendered state) not messagesData (data source)
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || streamMessages.length === 0) return;

    const action = pendingScrollAction.current;
    if (!action) return;

    if (action.type === "restore") {
      const { prevScrollHeight, prevScrollTop } = action;
      const newScrollHeight = container.scrollHeight;
      // Add the height difference to maintain the same visual position
      container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
    } else if (action.type === "initial") {
      container.scrollTop = container.scrollHeight;
    }

    pendingScrollAction.current = null;
  }, [streamMessages]);

  // Handle loading older messages when scrolling up
  const handleLoadMoreMessages = useCallback(() => {
    if (!hasMoreMessages || isLoadingMore || !endCursor) return;

    const container = messagesContainerRef.current;
    if (container) {
      // Save current scroll position for restoration after new messages load
      pendingScrollAction.current = {
        type: "restore",
        prevScrollHeight: container.scrollHeight,
        prevScrollTop: container.scrollTop,
      };
    }

    // Mark that we're loading more so sync effect knows to update messages
    isLoadingMoreRef.current = true;

    void fetchMore({
      variables: { before: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          aiThreadMessages: {
            ...fetchMoreResult.aiThreadMessages,
            edges: [
              ...fetchMoreResult.aiThreadMessages.edges,
              ...prev.aiThreadMessages.edges,
            ],
          },
        };
      },
    });
  }, [hasMoreMessages, isLoadingMore, endCursor, fetchMore]);

  // Scroll handler to detect when user scrolls near the top and track if at bottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Track if user is at the bottom (within 50px threshold)
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    isAtBottomRef.current = isAtBottom;

    // Load more when scrolled within 100px of the top
    if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      handleLoadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, handleLoadMoreMessages]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll to bottom only when:
  // 1. User is at the bottom (following conversation)
  // 2. User just sent a message (shouldScrollOnNextUpdate flag)
  useEffect(() => {
    // Always scroll if explicitly requested (after sending a message)
    if (shouldScrollOnNextUpdate.current) {
      shouldScrollOnNextUpdate.current = false;
      scrollToBottom();
      return;
    }

    // Auto-scroll if user is at bottom (following the conversation)
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [streamMessages, scrollToBottom]);

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
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim()) return;

    const messageText = input.value;
    input.value = "";
    setHasInput(false);

    // Reset textarea height after clearing
    if (input) {
      input.style.height = "auto";
    }

    // Scroll to bottom when user sends a message
    shouldScrollOnNextUpdate.current = true;

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

    void sendMessage({ message: messageText, threadId: threadIdToUse, mode: aiMode });
  };

  // Handle Enter to submit, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  // Auto-resize textarea as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    setHasInput(textarea.value.trim().length > 0);
  };

  const handleSuggestionClick = (text: string) => {
    if (inputRef.current) {
      inputRef.current.value = text;
      inputRef.current.focus();
      // Auto-resize after setting value
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  // Resize handle logic
  const isResizing = useRef(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      // Calculate new width based on mouse position
      // Panel starts at left: 72px, so width = mouseX - 72
      const newWidth = e.clientX - 72;
      const clampedWidth = Math.min(
        Math.max(newWidth, PANEL_MIN_WIDTH),
        PANEL_MAX_WIDTH
      );
      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setPanelWidth]);

  return (
    <aside
      className={`${styles.panel} ${!isOpen ? styles.panelClosed : ""}`}
      style={{ width: isOpen ? panelWidth : 0 }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.iconButton} onClick={close} title="Close">
            <X size={18} />
          </button>
          <h2 className={styles.headerTitle}>Untitled chat</h2>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconButton}
            onClick={handleCreateThread}
            title="New chat"
          >
            <Plus size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => setShowHistory(true)}
            title="Chat history"
          >
            <History size={18} />
          </button>
        </div>
      </div>

      {/* Thread History Overlay */}
      {showHistory && (
        <ThreadHistory
          onClose={() => setShowHistory(false)}
          onSelectThread={handleSelectThread}
          currentThreadId={currentThreadId}
        />
      )}

      <div className={styles.content}>
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className={styles.messages}
          onScroll={handleScroll}
        >
          {/* Loading indicator for older messages */}
          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <Loader2 size={16} className={styles.loadingSpinner} />
              <span>Loading older messages...</span>
            </div>
          )}
          {streamMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <Image
                  src="/icons/ai.svg"
                  alt="AI"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className={styles.emptyStateTitle}>
                How can{" "}
                <span className={styles.emptyStateTitleHighlight}>
                  I help you?
                </span>
              </h3>
              <div className={styles.emptyStateSuggestions}>
                <button
                  type="button"
                  className={styles.suggestionButton}
                  onClick={() =>
                    handleSuggestionClick("What can you help me with?")
                  }
                >
                  <HelpCircle size={20} className={styles.suggestionIcon} />
                  <span>What can you help me with?</span>
                </button>
                <button
                  type="button"
                  className={styles.suggestionButton}
                  onClick={() =>
                    handleSuggestionClick("Show me prompt examples")
                  }
                >
                  <MessageSquare size={20} className={styles.suggestionIcon} />
                  <span>Show me prompt examples</span>
                </button>
              </div>
            </div>
          ) : (
            streamMessages.map((msg, index) => {
              const prevMsg: ChatMessage | undefined =
                streamMessages[index - 1];
              const showDateSeparator = shouldShowDateSeparator(
                msg.timestamp,
                prevMsg?.timestamp ?? null
              );

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

              const isUser = msg.role === "user";
              const isStreaming =
                !isUser &&
                isLoading &&
                index === streamMessages.length - 1 &&
                !msg.content;

              return (
                <div key={index}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <div className={styles.dateSeparator}>
                      <span className={styles.dateSeparatorLine} />
                      <span className={styles.dateSeparatorText}>
                        {getDateLabel(msg.timestamp)}
                      </span>
                      <span className={styles.dateSeparatorLine} />
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={`${styles.messageWrapper} ${
                      isUser ? styles.messageWrapperUser : ""
                    }`}
                  >
                    {/* Avatar and Header */}
                    <div className={styles.messageHeader}>
                      {isUser ? (
                        <div className={styles.userAvatar}>
                          <User size={14} />
                        </div>
                      ) : (
                        <Image
                          src="/icons/ai.svg"
                          alt="AI"
                          width={20}
                          height={20}
                          className={styles.aiAvatar}
                        />
                      )}
                      {isUser && (
                        <span className={styles.userLabel}>YOU</span>
                      )}
                      <span
                        className={styles.messageTime}
                        title={formatFullDateTime(msg.timestamp)}
                      >
                        {formatRelativeTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message Content */}
                    {isStreaming ? (
                      <div className={styles.loadingSkeleton}>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`${styles.message} ${
                          isUser
                            ? styles.messageUser
                            : styles.messageAssistant
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {/* AI Thinking indicator - show when loading and AI hasn't started streaming yet */}
          {isLoading &&
            streamMessages.length > 0 &&
            streamMessages.at(-1)?.role === "user" && (
              <div className={styles.messageWrapper}>
                <div className={styles.messageHeader}>
                  <Image
                    src="/icons/ai.svg"
                    alt="AI"
                    width={20}
                    height={20}
                    className={styles.aiAvatar}
                  />
                  <span className={styles.messageTime}>now</span>
                </div>
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonRow}>
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                  </div>
                  <div className={styles.skeletonRow}>
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                    <div className={styles.skeletonWord} />
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Input */}
      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          {/* Top row: textarea */}
          <div className={styles.inputTop}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Enter a prompt..."
              disabled={isLoading}
              rows={1}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            />
          </div>
          {/* Bottom row: actions */}
          <div className={styles.inputBottom}>
            <div className={styles.inputLeftActions}>
              <button
                type="button"
                className={styles.inputActionButton}
                title="Attach file"
                disabled={isLoading}
              >
                <Paperclip size={18} />
              </button>
            </div>
            <div className={styles.inputRightActions}>
              {/* Mode dropdown */}
              <div className={styles.modeDropdownContainer} ref={modeDropdownRef}>
                <button
                  type="button"
                  className={styles.modeDropdownButton}
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  disabled={isLoading}
                >
                  {AI_MODE_LABELS[aiMode]}
                  <ChevronDown size={14} />
                </button>
                {showModeDropdown && (
                  <div className={styles.modeDropdownMenu}>
                    <button
                      type="button"
                      className={`${styles.modeDropdownItem} ${aiMode === "fast" ? styles.modeDropdownItemActive : ""}`}
                      onClick={() => {
                        setAiMode("fast");
                        setShowModeDropdown(false);
                      }}
                    >
                      {AI_MODE_LABELS.fast}
                    </button>
                    <button
                      type="button"
                      className={`${styles.modeDropdownItem} ${aiMode === "smarter" ? styles.modeDropdownItemActive : ""}`}
                      onClick={() => {
                        setAiMode("smarter");
                        setShowModeDropdown(false);
                      }}
                    >
                      {AI_MODE_LABELS.smarter}
                    </button>
                  </div>
                )}
              </div>
              {/* Microphone button */}
              <button
                type="button"
                className={styles.inputActionButton}
                title="Voice input"
                disabled={isLoading}
              >
                <Mic size={18} />
              </button>
              {/* Submit/Interrupt button */}
              {isLoading ? (
                <button
                  type="button"
                  className={`${styles.submitButton} ${styles.submitButtonInterrupt}`}
                  onClick={interrupt}
                  title="Stop generating"
                >
                  <Square size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!hasInput}
                  title="Send message"
                >
                  <ArrowUp size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </aside>
  );
}
