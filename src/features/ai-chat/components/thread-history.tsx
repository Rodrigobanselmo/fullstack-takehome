"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { NetworkStatus } from "@apollo/client";
import { useQueryAIThreads, type AIThread } from "../api/ai-thread.queries";
import { useDeleteAIThreadMutation } from "../api/ai-thread.mutations";
import { formatRelativeTime, getDateLabel } from "../utils/format-time";
import styles from "./thread-history.module.css";

interface ThreadHistoryProps {
  onClose: () => void;
  onSelectThread: (threadId: string) => void;
  currentThreadId: string | null;
}

interface GroupedThreads {
  label: string;
  threads: AIThread[];
}

function groupThreadsByDate(threads: AIThread[]): GroupedThreads[] {
  const groups = new Map<string, AIThread[]>();

  threads.forEach((thread) => {
    const date = new Date(thread.updatedAt);
    const label = getDateLabel(date);
    
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(thread);
  });

  return Array.from(groups.entries()).map(([label, threads]) => ({
    label,
    threads,
  }));
}

export function ThreadHistory({
  onClose,
  onSelectThread,
  currentThreadId,
}: ThreadHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, loading, fetchMore, networkStatus } = useQueryAIThreads({
    first: 20,
    search: debouncedSearch || null,
  });

  const [deleteThread] = useDeleteAIThreadMutation();

  const isLoadingMore = networkStatus === NetworkStatus.fetchMore;
  const threads = data?.aiThreads.edges.map((e) => e.node) ?? [];
  const hasNextPage = data?.aiThreads.pageInfo.hasNextPage ?? false;
  const endCursor = data?.aiThreads.pageInfo.endCursor ?? null;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && endCursor) {
      void fetchMore({
        variables: {
          after: endCursor,
          search: debouncedSearch || null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            aiThreads: {
              ...fetchMoreResult.aiThreads,
              edges: [
                ...prev.aiThreads.edges,
                ...fetchMoreResult.aiThreads.edges,
              ],
            },
          };
        },
      });
    }
  }, [hasNextPage, isLoadingMore, endCursor, fetchMore, debouncedSearch]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteThread({ variables: { id: threadId } });
  };

  const handleSelectThread = (threadId: string) => {
    onSelectThread(threadId);
    onClose();
  };

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={styles.title}>Chats</h2>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Thread List */}
        <div
          ref={scrollContainerRef}
          className={styles.threadList}
          onScroll={handleScroll}
        >
          {loading && threads.length === 0 ? (
            <div className={styles.loading}>Loading...</div>
          ) : threads.length === 0 ? (
            <div className={styles.empty}>
              {debouncedSearch ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            groupedThreads.map((group) => (
              <div key={group.label} className={styles.group}>
                <div className={styles.groupLabel}>{group.label}</div>
                {group.threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === currentThreadId}
                    onSelect={() => handleSelectThread(thread.id)}
                    onDelete={(e) => handleDelete(thread.id, e)}
                  />
                ))}
              </div>
            ))
          )}
          {isLoadingMore && (
            <div className={styles.loadingMore}>Loading more...</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ThreadItemProps {
  thread: AIThread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ThreadItem({ thread, isActive, onSelect, onDelete }: ThreadItemProps) {
  const date = new Date(thread.updatedAt);

  return (
    <div
      className={`${styles.threadItem} ${isActive ? styles.threadItemActive : ""}`}
      onClick={onSelect}
    >
      <div className={styles.threadContent}>
        <span className={styles.threadTitle}>{thread.title}</span>
        <span className={styles.threadTime}>{formatRelativeTime(date)}</span>
      </div>
      <button
        className={styles.deleteButton}
        onClick={onDelete}
        title="Delete chat"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

