import { z } from "zod";
import { canUseAI } from "./ai.auth";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import { invokeChatAgent } from "~/server/ai";
import {
  aiThreadRepository,
  type AIThread,
  type AIMessage,
  type AIMessageAttachment,
  type AIThreadConnection,
  type AIMessageConnection,
} from "~/server/repositories/ai-thread.repository";
import { getPresignedDownloadUrl } from "~/lib/s3";

// Inline validation schemas for better type inference
const aiThreadIdSchema = z.object({
  id: z.string().min(1, "Thread ID is required"),
});

const aiThreadMessagesSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  first: z.number().min(1).max(100).optional().default(20),
  before: z.string().nullable().optional(),
});

const aiThreadsPaginatedSchema = z.object({
  first: z.number().min(1).max(100).optional().default(20),
  after: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
});

const createAIThreadInputSchema = z.object({
  title: z.string().optional(),
});

const updateAIThreadInputSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  title: z.string().min(1, "Title is required"),
});

const sendAIThreadMessageInputSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  message: z.string().min(1, "Message is required"),
});

function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join(", ");
}

export const aiResolvers = {
  AIMessage: {
    files: (parent: AIMessage) => {
      // Transform 'attachments' from repository to 'files' for GraphQL
      return parent.attachments ?? [];
    },
  },

  AIMessageAttachment: {
    url: async (parent: AIMessageAttachment): Promise<string | null> => {
      try {
        return await getPresignedDownloadUrl(
          {
            key: parent.key,
            bucket: parent.bucket,
            region: parent.region,
          },
          3600, // 1 hour expiry
        );
      } catch (error) {
        console.error("Failed to generate presigned URL for AI attachment:", {
          fileId: parent.fileId,
          key: parent.key,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    },
  },

  Query: {
    aiThreads: async (
      _: unknown,
      args: { first?: number; after?: string | null; search?: string | null },
      context: GraphQLContext,
    ): Promise<AIThreadConnection> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = aiThreadsPaginatedSchema.safeParse(args);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.findByUserPaginated({
        userId: context.user!.id,
        first: result.data.first,
        after: result.data.after,
        search: result.data.search,
      });
    },

    aiThread: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ): Promise<AIThread | null> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = aiThreadIdSchema.safeParse(args);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.findById(result.data.id, context.user!.id);
    },

    aiThreadMessages: async (
      _: unknown,
      args: { threadId: string; first?: number; before?: string | null },
      context: GraphQLContext,
    ): Promise<AIMessageConnection> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = aiThreadMessagesSchema.safeParse(args);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.getMessages(
        result.data.threadId,
        context.user!.id,
        {
          first: result.data.first,
          before: result.data.before,
        },
      );
    },
  },

  Mutation: {
    createAIThread: async (
      _: unknown,
      { input }: { input?: { title?: string } },
      context: GraphQLContext,
    ): Promise<AIThread> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = createAIThreadInputSchema.safeParse(input ?? {});
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.create(context.user!.id, result.data.title);
    },

    updateAIThread: async (
      _: unknown,
      { input }: { input: { threadId: string; title: string } },
      context: GraphQLContext,
    ): Promise<AIThread | null> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = updateAIThreadInputSchema.safeParse(input);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.updateTitle(
        result.data.threadId,
        context.user!.id,
        result.data.title,
      );
    },

    deleteAIThread: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ): Promise<boolean> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = aiThreadIdSchema.safeParse(args);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }
      return aiThreadRepository.delete(result.data.id, context.user!.id);
    },

    sendAIThreadMessage: async (
      _: unknown,
      { input }: { input: { threadId: string; message: string } },
      context: GraphQLContext,
    ): Promise<{ message: AIMessage; response: AIMessage }> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      const result = sendAIThreadMessageInputSchema.safeParse(input);
      if (!result.success) {
        throw InvalidInputError(formatZodError(result.error));
      }

      const { threadId, message } = result.data;

      // Verify thread exists and belongs to user
      const thread = await aiThreadRepository.findById(
        threadId,
        context.user!.id,
      );
      if (!thread) {
        throw InvalidInputError("Thread not found");
      }

      // Save user message
      const userMessage = await aiThreadRepository.addMessage(
        threadId,
        "user",
        message,
      );

      // Get recent history for AI context (excludes tool messages)
      const historyForAI =
        await aiThreadRepository.getMessagesForAIHistory(threadId, 20);
      // Remove the last message (the one we just added) from history
      const historyWithoutCurrent = historyForAI.slice(0, -1);

      // Get AI response
      const aiResult = await invokeChatAgent({
        message,
        history: historyWithoutCurrent,
      });

      // Save AI response
      const aiMessage = await aiThreadRepository.addMessage(
        threadId,
        "assistant",
        aiResult.response,
      );

      return {
        message: userMessage,
        response: aiMessage,
      };
    },
  },
};
