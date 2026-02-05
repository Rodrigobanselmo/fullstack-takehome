"use client";

import { gql, useQuery } from "@apollo/client";

// Types (since GraphQL types aren't generated yet)
export interface AIThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  threadId: string;
  role: string;
  content: string;
  createdAt: string;
}

interface AIThreadsQuery {
  aiThreads: AIThread[];
}

interface AIThreadMessagesQuery {
  aiThreadMessages: AIMessage[];
}

interface AIThreadMessagesVariables {
  threadId: string;
}

export const AI_THREADS_QUERY = gql`
  query AIThreads {
    aiThreads {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const AI_THREAD_MESSAGES_QUERY = gql`
  query AIThreadMessages($threadId: ID!) {
    aiThreadMessages(threadId: $threadId) {
      id
      threadId
      role
      content
      createdAt
    }
  }
`;

export function useQueryAIThreads() {
  return useQuery<AIThreadsQuery>(AI_THREADS_QUERY);
}

export function useQueryAIThreadMessages(threadId: string | null) {
  return useQuery<AIThreadMessagesQuery, AIThreadMessagesVariables>(
    AI_THREAD_MESSAGES_QUERY,
    {
      variables: { threadId: threadId ?? "" },
      skip: !threadId,
    },
  );
}

