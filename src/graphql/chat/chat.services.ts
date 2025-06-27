import { formatToGQLConnection } from "~/lib/pagination";
import { prisma } from "~/server/database/prisma";
import type {
  Conversation,
  Message,
  MessageConnection,
} from "generated/gql/graphql";
import type {
  FindMessagesArgs,
  CreateMessageArgs,
  FindConversationsArgs,
  FindConversationByIdArgs,
  FindConversationByParticipantsArgs,
} from "./chat.types";
import { publish } from "~/server/utils/pubsub";
import { ConversationNotFoundError } from "./chat.errors";
import { conversationRepository } from "~/server/repositories/conversation.repository";
import { messageRepository } from "~/server/repositories/message.repository";

export const DEFAULT_PAGE_SIZE = 20;

export async function findMessagesService({
  conversationId,
  userId,
  pagination,
}: FindMessagesArgs): Promise<MessageConnection> {
  const hasAccess = await conversationRepository.hasAccess(
    conversationId,
    userId,
  );

  if (!hasAccess) {
    throw ConversationNotFoundError();
  }

  const limit = pagination.first ?? DEFAULT_PAGE_SIZE;

  const allFetchedMessages = await messageRepository.findManyByConversationId(
    conversationId,
    limit + 1,
    pagination.after ?? undefined,
  );

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
  const hasAccess = await conversationRepository.hasAccess(
    conversationId,
    senderId,
  );

  if (!hasAccess) {
    throw ConversationNotFoundError();
  }

  const message = await messageRepository.create(
    conversationId,
    text,
    senderId,
  );

  publish(conversationId, message);

  return message;
}

export async function findConversationsService({
  userId,
}: FindConversationsArgs): Promise<Conversation[]> {
  return conversationRepository.findUserConversations(userId);
}

export async function findConversationByIdService({
  conversationId,
  userId,
}: FindConversationByIdArgs): Promise<Conversation | null> {
  const conversation = await conversationRepository.findById(
    conversationId,
    userId,
  );

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
  const conversation = await conversationRepository.findByParticipants(
    contractorId,
    homeownerId,
    userId,
  );

  if (!conversation) {
    throw ConversationNotFoundError();
  }

  return conversation;
}
