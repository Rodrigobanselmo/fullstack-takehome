"use client";

import { useRef, useEffect, useLayoutEffect, useCallback, useState, type DragEvent } from "react";
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
  Check,
  Upload,
} from "lucide-react";
import {
  useAIChat,
  PANEL_MIN_WIDTH,
  PANEL_MAX_WIDTH,
} from "../context/ai-chat-context";
import {
  useAIChatStream,
  type ChatMessage,
  type ChatMessageAttachment,
} from "../hooks/use-ai-chat-stream";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { useFileAttachments } from "../hooks/use-file-attachments";
import { usePageContext } from "../hooks/use-page-context";
import { type AIMode, AI_MODE_LABELS, DEFAULT_AI_MODE } from "~/lib/ai-types";
import {
  useQueryAIThreadMessages,
  useQueryAIThread,
} from "../api/ai-thread.queries";
import {
  useCreateAIThreadMutation,
  useUpdateAIThreadMutation,
} from "../api/ai-thread.mutations";
import {
  formatRelativeTime,
  formatFullDateTime,
  getDateLabel,
  shouldShowDateSeparator,
} from "../utils/format-time";
import { ThreadHistory } from "./thread-history";
import { AudioWaveform } from "./audio-waveform";
import { AttachmentPreview } from "./attachment-preview";
import { MessageAttachments } from "./message-attachments";
import { useToast } from "~/components/ui/toast";
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    data: messagesData,
    fetchMore,
    networkStatus,
  } = useQueryAIThreadMessages(currentThreadId);
  const { data: threadData } = useQueryAIThread(currentThreadId);
  const [createThread] = useCreateAIThreadMutation();
  const [updateThread] = useUpdateAIThreadMutation();

  const currentThreadTitle = threadData?.aiThread?.title ?? "Untitled chat";

  const {
    messages: streamMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
    interrupt,
  } = useAIChatStream();

  // Audio recording for voice input
  const {
    state: recordingState,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    waveformData,
  } = useAudioRecorder();

  // File attachments for multimodal input
  const {
    attachments,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadedFileIds,
  } = useFileAttachments();

  // Track current page context for AI context awareness
  const pageContext = usePageContext();

  // Toast notifications
  const toast = useToast();

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasInput, setHasInput] = useState(false);
  const pendingTranscriptionRef = useRef<string | null>(null);
  const cursorPositionRef = useRef<number>(0);
  const savedInputValueRef = useRef<string>("");
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

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Sync messages from GraphQL when data arrives
  // Sync on: initial load (empty state) or pagination (isLoadingMoreRef)
  // Don't sync: while streaming or right after streaming (messages are already correct)
  useEffect(() => {
    // Don't overwrite while streaming
    if (isLoading) return;

    // Helper to map DB files to ChatMessageAttachment format
    const mapFiles = (
      files: { id: string; fileId: string; filename: string; mimeType: string; size: number; url: string | null }[]
    ): ChatMessageAttachment[] => files.map((f) => ({
      id: f.id,
      fileId: f.fileId,
      filename: f.filename,
      mimeType: f.mimeType,
      size: f.size,
      url: f.url,
    }));

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
          files: m.files ? mapFiles(m.files) : undefined,
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
        files: m.files ? mapFiles(m.files) : undefined,
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

  const handleCreateThread = () => {
    // Just go to "new chat" state - no thread is created until a message is sent
    setCurrentThreadId(null);
    clearMessages();
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim() && attachments.length === 0) return;

    const messageText = input?.value || "";
    if (input) {
      input.value = "";
      input.style.height = "auto";
    }
    setHasInput(false);

    // Get file IDs before clearing attachments
    const fileIds = getUploadedFileIds();

    // Clear attachments after getting IDs
    clearAttachments();

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

    void sendMessage({
      message: messageText,
      threadId: threadIdToUse,
      mode: aiMode,
      pageContext,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    });
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

  // Handle file attachment button click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const rejected = await addFiles(files);
      if (rejected.length > 0) {
        const fileNames = rejected.map((f) => f.filename).join(", ");
        toast.error(
          "Unsupported file type",
          `Could not upload: ${fileNames}. Supported: images, videos, audio, PDF.`,
        );
      }
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Drag and drop handlers for full chat area
  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const rejected = await addFiles(files);
        if (rejected.length > 0) {
          const fileNames = rejected.map((f) => f.filename).join(", ");
          toast.error(
            "Unsupported file type",
            `Could not upload: ${fileNames}. Supported: images, videos, audio, PDF.`,
          );
        }
      }
    },
    [addFiles, toast],
  );

  // Handle mic button click - start recording
  const handleMicClick = async () => {
    if (recordingState === "idle") {
      // Save cursor position and input value before textarea gets unmounted
      if (inputRef.current) {
        savedInputValueRef.current = inputRef.current.value;
        cursorPositionRef.current =
          inputRef.current.selectionStart ?? inputRef.current.value.length;
      }
      await startRecording();
    }
  };

  // Handle confirm recording - stop and transcribe
  const handleConfirmRecording = async () => {
    if (recordingState !== "recording") return;

    const transcribedText = await stopRecording();
    if (transcribedText) {
      // Store the transcribed text to be applied when textarea is available
      pendingTranscriptionRef.current = transcribedText;
    }
  };

  // Apply pending transcription when textarea becomes available (after recording UI hides)
  useEffect(() => {
    if (recordingState === "idle" && inputRef.current) {
      const textarea = inputRef.current;
      const transcribedText = pendingTranscriptionRef.current;

      // Use saved input value (textarea was unmounted during recording)
      const savedValue = savedInputValueRef.current;
      const cursorPos = Math.min(cursorPositionRef.current, savedValue.length);

      if (transcribedText) {
        // Insert transcribed text at cursor position (with space padding if needed)
        pendingTranscriptionRef.current = null;

        const before = savedValue.slice(0, cursorPos);
        const after = savedValue.slice(cursorPos);
        const needsSpaceBefore = before.length > 0 && !before.endsWith(" ");
        const needsSpaceAfter = after.length > 0 && !after.startsWith(" ");

        const insertText =
          (needsSpaceBefore ? " " : "") +
          transcribedText +
          (needsSpaceAfter ? " " : "");

        const newValue = before + insertText + after;
        textarea.value = newValue;

        // Move cursor to end of inserted text
        const newCursorPos = cursorPos + insertText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();

        // Auto-resize after adding text
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        setHasInput(newValue.trim().length > 0);

        // Clear saved value
        savedInputValueRef.current = "";
      } else if (savedValue) {
        // No transcription but we have saved value - restore it (e.g., after cancel)
        textarea.value = savedValue;
        textarea.setSelectionRange(cursorPos, cursorPos);
        setHasInput(savedValue.trim().length > 0);
        savedInputValueRef.current = "";
      }
    }
  }, [recordingState]);

  // Handle cancel recording
  const handleCancelRecording = () => {
    cancelRecording();
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
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDraggingOver && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropOverlayContent}>
            <Upload size={48} strokeWidth={1.5} />
            <span>Drop files here</span>
          </div>
        </div>
      )}

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
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              className={styles.headerTitleInput}
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (
                  editTitleValue.trim() &&
                  editTitleValue.trim() !== currentThreadTitle &&
                  currentThreadId
                ) {
                  void updateThread({
                    variables: {
                      input: {
                        threadId: currentThreadId,
                        title: editTitleValue.trim(),
                      },
                    },
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  titleInputRef.current?.blur();
                } else if (e.key === "Escape") {
                  setEditTitleValue(currentThreadTitle);
                  setIsEditingTitle(false);
                }
              }}
            />
          ) : (
            <h2
              className={styles.headerTitle}
              onClick={() => {
                if (currentThreadId) {
                  setEditTitleValue(currentThreadTitle);
                  setIsEditingTitle(true);
                }
              }}
              style={{ cursor: currentThreadId ? "text" : "default" }}
            >
              {currentThreadTitle}
            </h2>
          )}
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
                        {/* Render file attachments if present */}
                        {msg.files && msg.files.length > 0 && (
                          <MessageAttachments files={msg.files} />
                        )}
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
      {(error ?? recordingError) && (
        <div className={styles.error}>{error ?? recordingError}</div>
      )}

      {/* Input - Show recording UI or normal input */}
      {recordingState === "recording" || recordingState === "transcribing" ? (
        /* Recording UI - Only waveform and cancel/confirm buttons */
        <div className={styles.inputContainer}>
          <div className={styles.recordingWrapper}>
            {/* Cancel button on the left */}
            <button
              type="button"
              className={styles.recordingCancelButton}
              onClick={handleCancelRecording}
              disabled={recordingState === "transcribing"}
              title="Cancel recording"
            >
              <X size={18} />
            </button>

            {/* Center: Waveform visualization */}
            <div className={styles.waveformContainer}>
              {recordingState === "transcribing" ? (
                <div className={styles.transcribingIndicator}>
                  <Loader2 size={18} className={styles.loadingSpinner} />
                  <span>Transcribing...</span>
                </div>
              ) : (
                <AudioWaveform data={waveformData} isRecording />
              )}
            </div>

            {/* Confirm button on the right */}
            <button
              type="button"
              className={styles.recordingConfirmButton}
              onClick={handleConfirmRecording}
              disabled={recordingState === "transcribing"}
              title="Confirm and transcribe"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Normal input UI */
        <form className={styles.inputContainer} onSubmit={handleSubmit}>
          {/* Attachment previews */}
          <AttachmentPreview
            attachments={attachments}
            onRemove={removeAttachment}
          />
          <div className={styles.inputWrapper}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {/* Top row: textarea */}
            <div className={styles.inputTop}>
              <textarea
                ref={inputRef}
                className={styles.input}
                placeholder="Enter a prompt..."
                disabled={isLoading || isUploading}
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
                  disabled={isLoading || isUploading}
                  onClick={handleAttachClick}
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
                  onClick={handleMicClick}
                  disabled={isLoading || isUploading}
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
                ) : isUploading ? (
                  <button
                    type="button"
                    className={styles.submitButton}
                    disabled
                    title="Uploading files..."
                  >
                    <Loader2 size={18} className={styles.spinner} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!hasInput && attachments.length === 0}
                    title="Send message"
                  >
                    <ArrowUp size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </aside>
  );
}
