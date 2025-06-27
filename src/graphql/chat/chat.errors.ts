import { GraphQLError } from "graphql";

export function ConversationNotFoundError() {
  return new GraphQLError("Conversation not found.", {
    extensions: {
      code: "CONVERSATION_NOT_FOUND",
      http: {
        status: 404,
      },
    },
  });
}
