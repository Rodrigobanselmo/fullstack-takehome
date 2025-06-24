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

export function InvalidFirstArgumentError() {
  return new GraphQLError("Argument 'first' must be a non-negative integer.", {
    extensions: {
      code: "INVALID_FIRST_ARGUMENT",
      http: {
        status: 400,
      },
    },
  });
}
