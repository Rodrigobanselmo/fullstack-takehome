import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError } from "graphql";

export function invalidCredentialsError() {
  return new GraphQLError("Invalid username or password.", {
    extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
  });
}
