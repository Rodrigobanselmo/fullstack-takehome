"use client";

import { gql, useMutation } from "@apollo/client";
import {
  AI_THREADS_QUERY,
  AI_THREAD_MESSAGES_QUERY,
  type AIThread,
  type AIMessage,
} from "./ai-thread.queries";

interface CreateAIThreadMutation {
  createAIThread: AIThread;
}

interface CreateAIThreadVariables {
  input?: { title?: string };
}

interface UpdateAIThreadMutation {
  updateAIThread: AIThread | null;
}

interface UpdateAIThreadVariables {
  input: { threadId: string; title: string };
}

interface DeleteAIThreadMutation {
  deleteAIThread: boolean;
}

interface DeleteAIThreadVariables {
  id: string;
}

interface SendAIThreadMessageMutation {
  sendAIThreadMessage: {
    message: AIMessage;
    response: AIMessage;
  };
}

interface SendAIThreadMessageVariables {
  input: { threadId: string; message: string };
}

const CREATE_AI_THREAD_MUTATION = gql`
  mutation CreateAIThread($input: CreateAIThreadInput) {
    createAIThread(input: $input) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_AI_THREAD_MUTATION = gql`
  mutation UpdateAIThread($input: UpdateAIThreadInput!) {
    updateAIThread(input: $input) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

const DELETE_AI_THREAD_MUTATION = gql`
  mutation DeleteAIThread($id: ID!) {
    deleteAIThread(id: $id)
  }
`;

const SEND_AI_THREAD_MESSAGE_MUTATION = gql`
  mutation SendAIThreadMessage($input: SendAIThreadMessageInput!) {
    sendAIThreadMessage(input: $input) {
      message {
        id
        threadId
        role
        content
        createdAt
      }
      response {
        id
        threadId
        role
        content
        createdAt
      }
    }
  }
`;

export function useCreateAIThreadMutation() {
  return useMutation<CreateAIThreadMutation, CreateAIThreadVariables>(
    CREATE_AI_THREAD_MUTATION,
    {
      refetchQueries: [{ query: AI_THREADS_QUERY }],
    },
  );
}

export function useUpdateAIThreadMutation() {
  return useMutation<UpdateAIThreadMutation, UpdateAIThreadVariables>(
    UPDATE_AI_THREAD_MUTATION,
    {
      refetchQueries: [{ query: AI_THREADS_QUERY }],
    },
  );
}

export function useDeleteAIThreadMutation() {
  return useMutation<DeleteAIThreadMutation, DeleteAIThreadVariables>(
    DELETE_AI_THREAD_MUTATION,
    {
      refetchQueries: [{ query: AI_THREADS_QUERY }],
    },
  );
}

export function useSendAIThreadMessageMutation(threadId: string | null) {
  return useMutation<SendAIThreadMessageMutation, SendAIThreadMessageVariables>(
    SEND_AI_THREAD_MESSAGE_MUTATION,
    {
      refetchQueries: threadId
        ? [{ query: AI_THREAD_MESSAGES_QUERY, variables: { threadId } }]
        : [],
    },
  );
}

