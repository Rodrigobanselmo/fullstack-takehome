"use client";

import { useState, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseAIChatStreamReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, threadId?: string | null) => Promise<void>;
  clearMessages: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export function useAIChatStream(): UseAIChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (message: string, threadId?: string | null) => {
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    // Prepare history (exclude the message we just added)
    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, threadId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as { content: string };
              assistantContent += parsed.content;

              setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (updated[lastIndex]?.role === "assistant") {
                  updated[lastIndex] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                }
                return updated;
              });
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Failed to get response");
        // Remove the empty assistant message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearMessages = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
  };

  return { messages, isLoading, error, sendMessage, clearMessages, setMessages };
}

