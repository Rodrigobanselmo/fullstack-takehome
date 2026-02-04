import { canUseAI } from "./ai.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import { sendAIMessageInputSchema } from "./ai.validators";
import { invokeChatAgent, type ChatMessage } from "~/server/ai";

interface SendAIMessageInput {
  message: string;
  history?: Array<{ role: string; content: string }>;
}

interface AIChatResponse {
  response: string;
  messages: ChatMessage[];
}

export const aiResolvers = {
  Mutation: {
    sendAIMessage: async (
      _: unknown,
      { input }: { input: SendAIMessageInput },
      context: GraphQLContext,
    ): Promise<AIChatResponse> => {
      const isUnauthorized = !canUseAI(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(sendAIMessageInputSchema, input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { message, history } = validation.data;

      const result = await invokeChatAgent({
        message,
        history: history as ChatMessage[] | undefined,
      });

      return {
        response: result.response,
        messages: result.messages,
      };
    },
  },
};

