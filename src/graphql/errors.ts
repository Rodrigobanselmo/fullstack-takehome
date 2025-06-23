import { GraphQLError } from "graphql";

export function UnauthorizedError() {
  return new GraphQLError("Unauthorized", {
    extensions: {
      code: "UNAUTHORIZED",
      http: { status: 403 },
    },
  });
}
