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
  toolName?: string | null;
  toolStatus?: string | null;
  createdAt: string;
}

export interface AIMessageEdge {
  cursor: string;
  node: AIMessage;
}

export interface AIMessagePageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AIMessageConnection {
  edges: AIMessageEdge[];
  pageInfo: AIMessagePageInfo;
  totalCount: number;
}

export interface AIThreadEdge {
  cursor: string;
  node: AIThread;
}

export interface AIThreadPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AIThreadConnection {
  edges: AIThreadEdge[];
  pageInfo: AIThreadPageInfo;
  totalCount: number;
}

interface AIThreadsQuery {
  aiThreads: AIThreadConnection;
}

interface AIThreadsVariables {
  first?: number;
  after?: string | null;
  search?: string | null;
}

interface AIThreadMessagesQuery {
  aiThreadMessages: AIMessageConnection;
}

interface AIThreadMessagesVariables {
  threadId: string;
  first?: number;
  before?: string | null;
}

export const AI_THREADS_QUERY = gql`
  query AIThreads($first: Int, $after: String, $search: String) {
    aiThreads(first: $first, after: $after, search: $search) {
      edges {
        cursor
        node {
          id
          title
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const AI_THREAD_MESSAGES_QUERY = gql`
  query AIThreadMessages($threadId: ID!, $first: Int, $before: String) {
    aiThreadMessages(threadId: $threadId, first: $first, before: $before) {
      edges {
        cursor
        node {
          id
          threadId
          role
          content
          toolName
          toolStatus
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export function useQueryAIThreads(variables: AIThreadsVariables = {}) {
  return useQuery<AIThreadsQuery, AIThreadsVariables>(AI_THREADS_QUERY, {
    variables: {
      first: variables.first ?? 20,
      after: variables.after ?? null,
      search: variables.search ?? null,
    },
    notifyOnNetworkStatusChange: true,
  });
}

export function useQueryAIThreadMessages(
  threadId: string | null,
  variables: { first?: number; before?: string | null } = {},
) {
  return useQuery<AIThreadMessagesQuery, AIThreadMessagesVariables>(
    AI_THREAD_MESSAGES_QUERY,
    {
      variables: {
        threadId: threadId ?? "",
        first: variables.first ?? 20,
        before: variables.before ?? null,
      },
      skip: !threadId,
      notifyOnNetworkStatusChange: true,
    },
  );
}
