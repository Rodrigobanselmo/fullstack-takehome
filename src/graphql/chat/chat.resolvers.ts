import type {
  MutationSendMessageArgs,
  QueryMessagesArgs,
} from "generated/gql/graphql"; // These types will be updated by your codegen
import { canViewJobs } from "~/lib/authorization";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { InvalidFirstArgumentError } from "./chat.errors";
import {
  createMessage,
  fetchPaginatedMessagesFromDB,
  findAndValidateUserConversation,
} from "./chat.services";

export const chatResolvers = {
  Query: {
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

      await findAndValidateUserConversation(conversationId, context.user!.id);

      return fetchPaginatedMessagesFromDB(conversationId, {
        first,
        after,
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

      await findAndValidateUserConversation(
        input.conversationId,
        context.user!.id,
      );

      const message = await createMessage(
        input.conversationId,
        input.text,
        context.user!.id,
      );

      return message.id;
    },
  },
};
