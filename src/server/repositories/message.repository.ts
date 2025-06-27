import { prisma } from "~/server/database/prisma";
import type { Message } from "generated/gql/graphql";

class PrismaMessageRepository {
  async findManyByConversationId(
    conversationId: string,
    limit: number,
    cursor?: string,
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      include: { sender: true },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
    });
  }

  async create(
    conversationId: string,
    text: string,
    senderId: string,
  ): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId,
        text,
        senderId,
      },
      include: { sender: true },
    });
  }

  async findById(messageId: string): Promise<Message | null> {
    return prisma.message.findFirst({
      where: { id: messageId },
      include: { sender: true },
    });
  }
}

export const messageRepository = new PrismaMessageRepository();
