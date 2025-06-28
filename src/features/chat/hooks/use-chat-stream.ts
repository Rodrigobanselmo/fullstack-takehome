import { useEffect, useRef, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import {
  MESSAGES_QUERY,
  getMessagesQueryVariables,
} from "../api/use-query-messages";
import type {
  MessagesQuery,
  Message,
  MessageEdge,
} from "generated/gql/graphql";
import { paths } from "~/config/paths";
import { captureException } from "~/lib/error-reporting";

export function useChatStream(conversationId: string | null | undefined) {
  const client = useApolloClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (typeof event.data !== "string" || !conversationId) return;

      try {
        const newMessageNode = JSON.parse(event.data) as Message;
        const newEdge: MessageEdge = {
          cursor: newMessageNode.id,
          node: newMessageNode,
        };

        client.cache.updateQuery<MessagesQuery>(
          {
            query: MESSAGES_QUERY,
            variables: getMessagesQueryVariables(conversationId),
          },
          (data) => {
            if (!data) return data;

            const existingMessage = data.messages.edges.some(
              (edge) => edge.node.id === newEdge.node.id,
            );

            if (existingMessage) {
              return data;
            }

            return {
              ...data,
              messages: {
                ...data.messages,
                edges: [newEdge, ...data.messages.edges],
              },
            };
          },
        );
      } catch (error) {
        captureException(error, { conversationId, messageData: event.data });
      }
    },
    [client, conversationId],
  );

  const handleError = useCallback(() => {
    captureException(new Error("Chat stream error"), { conversationId });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || typeof conversationId !== "string") {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const eventSource = new EventSource(
      paths.api.chat.stream.getHref(conversationId),
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = handleMessage;
    eventSource.onerror = handleError;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [conversationId, handleMessage, handleError]);
}
