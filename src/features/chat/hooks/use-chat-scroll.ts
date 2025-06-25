import { useEffect, useRef } from "react";

const SCROLL_THRESHOLD = 300;

export function useChatScroll({
  messages,
  hasNextPage,
  loading,
  onLoadMore,
}: {
  messages: unknown[];
  hasNextPage?: boolean;
  loading?: boolean;
  onLoadMore: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasNextPage || loading) return;
    const handleScroll = () => {
      if (container.scrollTop < SCROLL_THRESHOLD) {
        prevHeightRef.current = container.scrollHeight;
        onLoadMore();
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasNextPage, loading]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (
      prevHeightRef.current &&
      container.scrollHeight > prevHeightRef.current
    ) {
      container.scrollTop =
        container.scrollHeight - prevHeightRef.current + SCROLL_THRESHOLD;
      prevHeightRef.current = 0;
    }
  }, [messages]);

  return {
    messagesEndRef,
    messagesContainerRef,
  };
}
