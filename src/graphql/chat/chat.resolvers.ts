import type {
  MutationSendMessageArgs,
  QueryMessagesArgs,
} from "generated/gql/graphql"; // These types will be updated by your codegen
import { canViewJobs } from "~/lib/authorization";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { InvalidFirstArgumentError } from "./chat.errors";
import {
  createMessageService,
  findMessagesService,
  findAndValidateConversationService,
  findConversationsService,
  findConversationByIdService,
} from "./chat.services";

export const chatResolvers = {
  Query: {
    conversations: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return findConversationsService({ userId: context.user!.id });
    },

    messages: async (
      _: unknown,
      { conversationId, first, after }: QueryMessagesArgs,
      context: GraphQLContext,
    ) => {
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
    ) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }
      return findConversationByIdService({
        conversationId: id,
        userId: context.user!.id,
      });
    },
  },
  Mutation: {
    sendMessage: async (
      _: unknown,
      { input }: MutationSendMessageArgs,
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canViewJobs(context.user);
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
