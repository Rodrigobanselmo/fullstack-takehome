import { formatToGQLConnection } from "~/lib/pagination";
import { prisma } from "~/server/database/prisma";
import { ConversationNotFoundError } from "./chat.errors";
import type {
  Conversation,
  Message,
  MessageConnection,
} from "generated/gql/graphql";
import type {
  FindAndValidateConversationArgs,
  FindMessagesArgs,
  CreateMessageArgs,
  FindConversationsArgs,
  FindConversationByIdArgs,
  FindConversationByParticipantsArgs,
  RawConversationRow,
} from "./chat.types";

export const DEFAULT_PAGE_SIZE = 20;

export async function findAndValidateConversationService({
  conversationId,
  userId,
}: FindAndValidateConversationArgs): Promise<void> {
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
  userId,
  pagination,
}: FindMessagesArgs): Promise<MessageConnection> {
  await findAndValidateConversationService({
    conversationId: conversationId,
    userId: userId,
  });

  const limit = pagination.first ?? DEFAULT_PAGE_SIZE;

  const allFetchedMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
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
}: CreateMessageArgs): Promise<Message> {
  await findAndValidateConversationService({
    conversationId: conversationId,
    userId: senderId,
  });

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

export async function findConversationsService({
  userId,
}: FindConversationsArgs): Promise<Conversation[]> {
  const rawConversations = await prisma.$queryRaw<RawConversationRow[]>`
    WITH UserConversations AS (
        SELECT c.*
        FROM conversations c
        WHERE (c.contractor_id = ${userId} OR c.homeowner_id = ${userId})
    ),
    LatestMessageTimesForUserConversations AS (
        SELECT
            m.conversation_id,
            MAX(m.created_at) AS latest_message_at
        FROM messages m
        INNER JOIN UserConversations uc ON m.conversation_id = uc.id
        GROUP BY m.conversation_id
    )
    SELECT
      uc.id,
      uc.created_at AS created_at,
      uc.updated_at AS updated_at,
      u1.id AS contractor_id,
      u1.name AS contractor_name,
      u2.id AS homeowner_id,
      u2.name AS homeowner_name
    FROM UserConversations uc 
    LEFT JOIN users u1 ON uc.contractor_id = u1.id
    LEFT JOIN users u2 ON uc.homeowner_id = u2.id
    LEFT JOIN LatestMessageTimesForUserConversations lmt ON uc.id = lmt.conversation_id
    ORDER BY
        lmt.latest_message_at DESC NULLS LAST,
        uc.updated_at DESC;
  `;

  return rawConversations.map((row) => ({
    id: row.id,
    contractor: {
      id: row.contractor_id,
      name: row.contractor_name,
    },
    homeowner: {
      id: row.homeowner_id,
      name: row.homeowner_name,
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function findConversationByIdService({
  conversationId,
  userId,
}: FindConversationByIdArgs): Promise<Conversation> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ contractorId: userId }, { homeownerId: userId }],
    },
    include: {
      contractor: true,
      homeowner: true,
    },
  });
  if (!conversation) {
    throw ConversationNotFoundError();
  }
  return conversation;
}

export async function findConversationByParticipantsService({
  contractorId,
  homeownerId,
  userId,
}: FindConversationByParticipantsArgs): Promise<Conversation> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      contractorId,
      homeownerId,
      OR: [{ contractorId: userId }, { homeownerId: userId }],
    },
    include: {
      contractor: true,
      homeowner: true,
    },
  });
  if (!conversation) {
    throw ConversationNotFoundError();
  }
  return conversation;
}
