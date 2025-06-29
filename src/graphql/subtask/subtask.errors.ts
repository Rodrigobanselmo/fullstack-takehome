import { GraphQLError } from "graphql";

export function SubtaskNotFoundError() {
  return new GraphQLError("Subtask not found.", {
    extensions: {
      code: "SUBTASK_NOT_FOUND",
      http: {
        status: 404,
      },
    },
  });
}

export function SubtaskAccessDeniedError() {
  return new GraphQLError("Subtask access denied.", {
    extensions: {
      code: "SUBTASK_ACCESS_DENIED",
      http: {
        status: 403,
      },
    },
  });
}
