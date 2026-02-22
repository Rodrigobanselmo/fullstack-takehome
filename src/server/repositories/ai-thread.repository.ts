import { prisma } from "~/server/database/prisma";
import type { AIMessageRole } from "generated/prisma";

export interface AIThread {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessageAttachment {
  id: string;
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  key: string;
  bucket: string;
  region: string;
  metadata?: Record<string, unknown> | null;
}

export interface AIMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string | null;
  toolStatus?: string | null;
  createdAt: Date;
  attachments?: AIMessageAttachment[];
}

export interface AIThreadConnection {
  edges: Array<{
    cursor: string;
    node: AIThread;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface AIMessageConnection {
  edges: Array<{
    cursor: string;
    node: AIMessage;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface FindByUserPaginatedOptions {
  userId: string;
  first?: number;
  after?: string | null;
  search?: string | null;
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

  async findByUserPaginated(
    options: FindByUserPaginatedOptions,
  ): Promise<AIThreadConnection> {
    const { userId, first = 20, after, search } = options;

    // Build where clause - exclude empty threads (lastMessageAt is null)
    const where: {
      userId: string;
      deletedAt: null;
      lastMessageAt: { not: null };
      title?: { contains: string; mode: "insensitive" };
    } = {
      userId,
      deletedAt: null,
      lastMessageAt: { not: null },
    };

    // Add search filter if provided
    if (search?.trim()) {
      where.title = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    // Get total count for this query
    const totalCount = await prisma.ai_threads.count({ where });

    // Get paginated results
    const threads = await prisma.ai_threads.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      take: first + 1, // Get one extra to determine hasNextPage
      cursor: after ? { id: after } : undefined,
      skip: after ? 1 : undefined, // Skip the cursor item
    });

    // Determine if there are more pages
    const hasNextPage = threads.length > first;
    const edges = threads.slice(0, first).map((thread) => ({
      cursor: thread.id,
      node: thread,
    }));

    const lastEdge = edges[edges.length - 1];
    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: lastEdge ? lastEdge.cursor : null,
      },
      totalCount,
    };
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

  async getMessageCount(threadId: string): Promise<number> {
    return prisma.ai_messages.count({
      where: { threadId },
    });
  }

  async addMessage(
    threadId: string,
    role: "user" | "assistant",
    content: string,
    fileIds?: string[],
  ): Promise<AIMessage> {
    const now = new Date();

    // Use transaction to create message and attach files atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the message
      // Create message with nested file attachments in one query
      const messageWithFiles = await tx.ai_messages.create({
        data: {
          threadId,
          role: role as AIMessageRole,
          content,
          // Nested create for file attachments
          ...(fileIds && fileIds.length > 0
            ? {
                files: {
                  create: fileIds.map((fileId) => ({
                    fileId,
                  })),
                },
              }
            : {}),
        },
        include: {
          files: {
            include: {
              file: true,
            },
          },
        },
      });

      // Update thread timestamps
      await tx.ai_threads.update({
        where: { id: threadId },
        data: { updatedAt: now, lastMessageAt: now },
      });

      return messageWithFiles;
    });

    return {
      id: result.id,
      threadId: result.threadId,
      role: result.role as "user" | "assistant" | "tool",
      content: result.content,
      toolName: result.toolName,
      toolStatus: result.toolStatus,
      createdAt: result.createdAt,
      attachments: result.files.map((f) => ({
        id: f.id,
        fileId: f.file.id,
        filename: f.file.filename,
        mimeType: f.file.mimeType,
        size: f.file.size,
        key: f.file.key,
        bucket: f.file.bucket,
        region: f.file.region,
        metadata: f.file.metadata as Record<string, unknown> | null,
      })),
    };
  }

  async addToolMessage(
    threadId: string,
    content: string,
    toolName: string,
    toolStatus: "running" | "success" | "error",
  ): Promise<AIMessage> {
    const now = new Date();
    const [message] = await prisma.$transaction([
      prisma.ai_messages.create({
        data: {
          threadId,
          role: "tool" as AIMessageRole,
          content,
          toolName,
          toolStatus,
        },
      }),
      prisma.ai_threads.update({
        where: { id: threadId },
        data: { lastMessageAt: now },
      }),
    ]);

    return {
      ...message,
      role: message.role as "user" | "assistant" | "tool",
    };
  }

  async updateToolMessage(
    messageId: string,
    content: string,
    toolStatus: "running" | "success" | "error",
  ): Promise<AIMessage | null> {
    const message = await prisma.ai_messages.update({
      where: { id: messageId },
      data: {
        content,
        toolStatus,
      },
    });

    return {
      ...message,
      role: message.role as "user" | "assistant" | "tool",
    };
  }

  async getMessages(
    threadId: string,
    userId: string,
    options: { first?: number; before?: string | null } = {},
  ): Promise<AIMessageConnection> {
    const { first = 20, before } = options;

    // Verify user owns the thread (must happen first for security)
    const thread = await this.findById(threadId, userId);
    if (!thread) {
      return {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      };
    }

    // Run count and findMany in parallel for better performance
    // Use Prisma's built-in cursor pagination
    const [totalCount, messages] = await Promise.all([
      prisma.ai_messages.count({
        where: { threadId },
      }),
      prisma.ai_messages.findMany({
        where: { threadId },
        orderBy: { createdAt: "desc" },
        take: first + 1,
        include: {
          files: {
            include: {
              file: true,
            },
          },
        },
        ...(before && {
          cursor: { id: before },
          skip: 1, // Skip the cursor record itself
        }),
      }),
    ]);

    const hasNextPage = messages.length > first;
    const slicedMessages = messages.slice(0, first);

    // Reverse to get chronological order (oldest first in the slice)
    const chronologicalMessages = slicedMessages.reverse();

    const edges = chronologicalMessages.map((m) => ({
      cursor: m.id,
      node: {
        id: m.id,
        threadId: m.threadId,
        role: m.role as "user" | "assistant" | "tool",
        content: m.content,
        toolName: m.toolName,
        toolStatus: m.toolStatus,
        createdAt: m.createdAt,
        attachments: m.files.map((f) => ({
          id: f.id,
          fileId: f.file.id,
          filename: f.file.filename,
          mimeType: f.file.mimeType,
          size: f.file.size,
          key: f.file.key,
          bucket: f.file.bucket,
          region: f.file.region,
          metadata: f.file.metadata as Record<string, unknown> | null,
        })),
      },
    }));

    const firstEdge = edges[0];

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: firstEdge ? firstEdge.cursor : null,
      },
      totalCount,
    };
  }

  /**
   * Get messages for AI history (excludes tool messages since AI doesn't need them)
   * Includes attachments for multimodal support
   */
  async getMessagesForAIHistory(
    threadId: string,
    limit = 20,
  ): Promise<
    Array<{
      role: "user" | "assistant";
      content: string;
      attachments?: AIMessageAttachment[];
    }>
  > {
    const messages = await prisma.ai_messages.findMany({
      where: {
        threadId,
        role: { in: ["user", "assistant"] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        files: {
          include: {
            file: true,
          },
        },
      },
    });

    return messages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      attachments:
        m.files.length > 0
          ? m.files.map((f) => ({
              id: f.id,
              fileId: f.file.id,
              filename: f.file.filename,
              mimeType: f.file.mimeType,
              size: f.file.size,
              key: f.file.key,
              bucket: f.file.bucket,
              region: f.file.region,
              metadata: f.file.metadata as Record<string, unknown> | null,
            }))
          : undefined,
    }));
  }
}

export const aiThreadRepository = new PrismaAIThreadRepository();
