import { prisma } from "~/server/database/prisma";
import type { AIMessageRole } from "generated/prisma";

export interface AIThread {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

class PrismaAIThreadRepository {
  async create(userId: string, title?: string): Promise<AIThread> {
    return prisma.ai_threads.create({
      data: {
        userId,
        title: title ?? "New Chat",
      },
    });
  }

  async findById(threadId: string, userId: string): Promise<AIThread | null> {
    return prisma.ai_threads.findFirst({
      where: {
        id: threadId,
        userId,
        deletedAt: null,
      },
    });
  }

  async findByUser(userId: string): Promise<AIThread[]> {
    return prisma.ai_threads.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async updateTitle(
    threadId: string,
    userId: string,
    title: string,
  ): Promise<AIThread | null> {
    const thread = await this.findById(threadId, userId);
    if (!thread) return null;

    return prisma.ai_threads.update({
      where: { id: threadId },
      data: { title },
    });
  }

  async delete(threadId: string, userId: string): Promise<boolean> {
    const thread = await this.findById(threadId, userId);
    if (!thread) return false;

    await prisma.ai_threads.update({
      where: { id: threadId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async addMessage(
    threadId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<AIMessage> {
    const message = await prisma.ai_messages.create({
      data: {
        threadId,
        role: role as AIMessageRole,
        content,
      },
    });

    // Update thread's updatedAt
    await prisma.ai_threads.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return {
      ...message,
      role: message.role as "user" | "assistant",
    };
  }

  async getMessages(threadId: string, userId: string): Promise<AIMessage[]> {
    // Verify user owns the thread
    const thread = await this.findById(threadId, userId);
    if (!thread) return [];

    const messages = await prisma.ai_messages.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => ({
      ...m,
      role: m.role as "user" | "assistant",
    }));
  }

  async getLastMessages(
    threadId: string,
    limit: number = 20,
  ): Promise<AIMessage[]> {
    const messages = await prisma.ai_messages.findMany({
      where: { threadId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.reverse().map((m) => ({
      ...m,
      role: m.role as "user" | "assistant",
    }));
  }
}

export const aiThreadRepository = new PrismaAIThreadRepository();
