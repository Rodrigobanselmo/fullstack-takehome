"use client";

import { useState, useRef } from "react";
import { type AIMode, type PageContext, DEFAULT_AI_MODE } from "~/lib/ai-types";

export interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolStatus?: "running" | "success" | "error";
  timestamp: Date;
}

// Stream event types from the backend
type StreamEvent =
  | { type: "content"; content: string }
  | { type: "tool_start"; tool: string; args: Record<string, unknown> }
  | { type: "tool_end"; tool: string; result: string; success: boolean }
  | { type: "error"; message: string };

// Human-readable tool names
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  list_recipes: "Listing recipes",
  get_recipe: "Getting recipe details",
  create_recipe: "Creating recipe",
  update_recipe: "Updating recipe",
  delete_recipe: "Deleting recipe",
  list_ingredients: "Listing ingredients",
  get_ingredient: "Getting ingredient details",
  create_ingredient: "Creating ingredient",
  update_ingredient: "Updating ingredient",
  delete_ingredient: "Deleting ingredient",
  search_similar_ingredients: "Searching for similar ingredients",
  list_recipe_groups: "Listing recipe groups",
  get_recipe_group: "Getting recipe group",
  create_recipe_group: "Creating recipe group",
  update_recipe_group: "Updating recipe group",
  delete_recipe_group: "Deleting recipe group",
  add_recipes_to_group: "Adding recipes to group",
  remove_recipes_from_group: "Removing recipes from group",
};

export interface SendMessageOptions {
  message: string;
  threadId?: string | null;
  mode?: AIMode;
  pageContext?: PageContext;
}

interface UseAIChatStreamReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (options: SendMessageOptions) => Promise<void>;
  clearMessages: () => void;
  setMessages: (messages: ChatMessage[]) => void;
  interrupt: () => void;
}

export function useAIChatStream(): UseAIChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (options: SendMessageOptions) => {
    const { message, threadId, mode = DEFAULT_AI_MODE, pageContext } = options;
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Prepare history (only user/assistant messages, not tool messages)
    const history = messages
      .filter((msg) => msg.role !== "tool")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, threadId, mode, pageContext }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let hasAssistantMessage = false;

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
              const event = JSON.parse(data) as StreamEvent;

              if (event.type === "tool_start") {
                // Add tool status message
                const displayName =
                  TOOL_DISPLAY_NAMES[event.tool] || event.tool;
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "tool",
                    content: `${displayName}...`,
                    toolName: event.tool,
                    toolStatus: "running",
                    timestamp: new Date(),
                  },
                ]);
              } else if (event.type === "tool_end") {
                // Update tool status message
                const displayName =
                  TOOL_DISPLAY_NAMES[event.tool] || event.tool;
                setMessages((prev) => {
                  const updated = [...prev];
                  // Find the last tool message with this tool name
                  for (let i = updated.length - 1; i >= 0; i--) {
                    const msg = updated[i];
                    if (
                      msg?.role === "tool" &&
                      msg.toolName === event.tool &&
                      msg.toolStatus === "running"
                    ) {
                      updated[i] = {
                        role: "tool",
                        content: event.success
                          ? `✓ ${displayName}`
                          : `✗ ${displayName}: ${event.result}`,
                        toolName: msg.toolName,
                        toolStatus: event.success ? "success" : "error",
                        timestamp: msg.timestamp,
                      };
                      break;
                    }
                  }
                  return updated;
                });
              } else if (event.type === "content") {
                assistantContent += event.content;

                if (!hasAssistantMessage) {
                  // Add assistant message placeholder
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: assistantContent,
                      timestamp: new Date(),
                    },
                  ]);
                  hasAssistantMessage = true;
                } else {
                  // Update assistant message
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    const lastMsg = updated[lastIndex];
                    if (lastMsg?.role === "assistant") {
                      updated[lastIndex] = {
                        role: "assistant",
                        content: assistantContent,
                        timestamp: lastMsg.timestamp,
                      };
                    }
                    return updated;
                  });
                }
              } else if (event.type === "error") {
                setError(event.message);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Failed to get response");
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

  const interrupt = () => {
    abortControllerRef.current?.abort();
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
    interrupt,
  };
}
