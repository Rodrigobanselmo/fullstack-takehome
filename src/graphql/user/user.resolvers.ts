import { canListHomeowners } from "./user.auth";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { getHomeowners } from "./user.services";
import type { User } from "generated/gql/graphql";

export const userResolvers = {
  Query: {
    homeowners: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<User[]> => {
      const isUnauthorized = !canListHomeowners(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }
      return getHomeowners();
    },
  },
};
