import { z } from "zod";
import { canUseAI } from "./ai.auth";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import { invokeChatAgent } from "~/server/ai";
import {
  aiThreadRepository,
  type AIThread,
  type AIMessage,
} from "~/server/repositories/ai-thread.repository";

// Inline validation schemas for better type inference
const aiThreadIdSchema = z.object({
  id: z.string().min(1, "Thread ID is required"),
});

const aiThreadMessagesSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
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
  Query: {
    aiThreads: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<AIThread[]> => {
      if (!canUseAI(context.user)) {
        throw UnauthorizedError();
      }
      return aiThreadRepository.findByUser(context.user!.id);
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
      args: { threadId: string },
      context: GraphQLContext,
    ): Promise<AIMessage[]> => {
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

      // Get recent history for context
      const history = await aiThreadRepository.getLastMessages(threadId, 20);
      const historyForAI = history.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get AI response
      const aiResult = await invokeChatAgent({
        message,
        history: historyForAI,
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
