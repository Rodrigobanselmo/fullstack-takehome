import { canSendMessage, canViewChat, canViewJobs } from "~/lib/authorization";
import type {
  Conversation,
  MessageConnection,
  MutationSendMessageArgs,
  QueryConversationByParticipantsArgs,
  QueryMessagesArgs,
} from "../../../generated/gql/graphql";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { InvalidFirstArgumentError } from "./chat.errors";
import {
  createMessageService,
  findAndValidateConversationService,
  findConversationByIdService,
  findConversationByParticipantsService,
  findConversationsService,
  findMessagesService,
} from "./chat.services";

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
      { conversationId, first, after }: QueryMessagesArgs,
      context: GraphQLContext,
    ): Promise<MessageConnection> => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const isInvalidFirstParameter =
        first !== undefined && first !== null && first < 0;

      if (isInvalidFirstParameter) {
        throw InvalidFirstArgumentError();
      }

      await findAndValidateConversationService({
        conversationId,
        userId: context.user!.id,
      });

      return findMessagesService({
        conversationId,
        pagination: { first, after },
      });
    },

    conversation: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ): Promise<Conversation> => {
      const isUnauthorized = !canViewChat(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }
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
      return findConversationByParticipantsService({
        contractorId: args.contractorId,
        homeownerId: args.homeownerId,
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

      await findAndValidateConversationService({
        conversationId: input.conversationId,
        userId: context.user!.id,
      });

      const message = await createMessageService({
        conversationId: input.conversationId,
        text: input.text,
        senderId: context.user!.id,
      });

      return message.id;
    },
  },
};
