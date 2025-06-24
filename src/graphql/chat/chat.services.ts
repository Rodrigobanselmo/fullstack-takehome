import { formatToGQLConnection } from "~/lib/pagination";
import { prisma } from "~/server/database/prisma";
import { ConversationNotFoundError } from "./chat.errors";

export const DEFAULT_PAGE_SIZE = 20;

export async function findAndValidateUserConversation(
  conversationId: string,
  userId: string,
): Promise<void> {
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

export async function fetchPaginatedMessagesFromDB(
  conversationId: string,
  paginationArgs: { first?: number | null; after?: string | null },
) {
  const limit = paginationArgs.first ?? DEFAULT_PAGE_SIZE;

  const allFetchedMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { sender: true },
    take: limit + 1,
    cursor: paginationArgs.after ? { id: paginationArgs.after } : undefined,
    skip: paginationArgs.after ? 1 : undefined,
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

export async function createMessage(
  conversationId: string,
  text: string,
  senderId: string,
) {
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
