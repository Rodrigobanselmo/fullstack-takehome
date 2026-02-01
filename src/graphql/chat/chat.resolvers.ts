import { canSendMessage, canViewChat } from "./chat.auth";
import { schemaValidation } from "~/lib/validation";
import type {
  Conversation,
  MessageConnection,
  MutationSendMessageArgs,
  QueryConversationArgs,
  QueryConversationByParticipantsArgs,
  QueryMessagesArgs,
} from "../../../generated/gql/graphql";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createMessageService,
  findConversationByIdService,
  findConversationByParticipantsService,
  findConversationsService,
  findMessagesService,
} from "./chat.services";
import {
  conversationByParticipantsQuerySchema,
  conversationQuerySchema,
  messagesQuerySchema,
  sendMessageInputSchema,
} from "./chat.validators";

export const chatResolvers = {
  Query: {
    conversations: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<Conversation[]> => {
      const isUnauthorized = !canViewChat(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return findConversationsService({ userId: context.user!.id });
    },

    messages: async (
      _: unknown,
      args: QueryMessagesArgs,
      context: GraphQLContext,
    ): Promise<MessageConnection> => {
      const isUnauthorized = !canViewChat(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(messagesQuerySchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { conversationId, first, after } = validation.data;

      return findMessagesService({
        conversationId: conversationId,
        pagination: { first: first, after: after },
        userId: context.user!.id,
      });
    },

    conversation: async (
      _: unknown,
      args: QueryConversationArgs,
      context: GraphQLContext,
    ): Promise<Conversation> => {
      const isUnauthorized = !canViewChat(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(conversationQuerySchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { id } = validation.data;

      return findConversationByIdService({
        conversationId: id,
        userId: context.user!.id,
      });
    },

    conversationByParticipants: async (
      _: unknown,
      args: QueryConversationByParticipantsArgs,
      context: GraphQLContext,
    ): Promise<Conversation> => {
      const isUnauthorized = !canViewChat(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(
        conversationByParticipantsQuerySchema,
        args,
      );
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { contractorId, homeownerId } = validation.data;

      return findConversationByParticipantsService({
        contractorId: contractorId,
        homeownerId: homeownerId,
        userId: context.user!.id,
      });
    },
  },
  Mutation: {
    sendMessage: async (
      _: unknown,
      { input }: MutationSendMessageArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canSendMessage(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(sendMessageInputSchema, input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { conversationId, text } = validation.data;

      const message = await createMessageService({
        conversationId: conversationId,
        text: text,
        senderId: context.user!.id,
      });

      return message.id;
    },
  },
};
