import { GraphQLError } from "graphql";

export function invalidCredentialsError() {
  return new GraphQLError("Invalid username or password.", {
    extensions: {
      code: "INVALID_CREDENTIALS",
      http: { status: 401 },
    },
  });
}
