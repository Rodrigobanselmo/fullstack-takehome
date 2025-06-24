import { formatToGQLConnection } from "~/lib/pagination";
import { prisma } from "~/server/database/prisma";
import { ConversationNotFoundError } from "./chat.errors";

export const DEFAULT_PAGE_SIZE = 20;

export async function findAndValidateConversationService({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<void> {
  const conversationExists = await prisma.conversation.count({
    where: {
      id: conversationId,
      OR: [{ contractorId: userId }, { homeownerId: userId }],
    },
  });

  if (conversationExists === 0) {
    throw ConversationNotFoundError();
  }
}

export async function findMessagesService({
  conversationId,
  pagination,
}: {
  conversationId: string;
  pagination: { first?: number | null; after?: string | null };
}) {
  const limit = pagination.first ?? DEFAULT_PAGE_SIZE;

  const allFetchedMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { sender: true },
    take: limit + 1,
    cursor: pagination.after ? { id: pagination.after } : undefined,
    skip: pagination.after ? 1 : undefined,
  });

  const hasNextPage = allFetchedMessages.length > limit;
  const messagesForPage = hasNextPage
    ? allFetchedMessages.slice(0, limit)
    : allFetchedMessages;

  return formatToGQLConnection(
    messagesForPage,
    hasNextPage,
    (message) => message.id,
  );
}

export async function createMessageService({
  conversationId,
  text,
  senderId,
}: {
  conversationId: string;
  text: string;
  senderId: string;
}) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      text,
      senderId,
    },
    include: { sender: true },
  });

  return message;
}

export async function findConversationsService({ userId }: { userId: string }) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ contractorId: userId }, { homeownerId: userId }],
    },
    include: {
      contractor: {
        select: {
          id: true,
          name: true,
        },
      },
      homeowner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
