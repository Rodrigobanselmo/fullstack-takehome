import { GraphQLError } from "graphql";

export function UnauthorizedError() {
  return new GraphQLError("Unauthorized", {
    extensions: {
      code: "UNAUTHORIZED",
      http: { status: 403 },
    },
  });
}

export function InvalidInputError(error: string) {
  return new GraphQLError(error, {
    extensions: {
      code: "INVALID_INPUT",
      http: { status: 400 },
    },
  });
}
