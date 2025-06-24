import { canListHomeowners } from "~/lib/authorization";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { getHomeowners } from "./user.services";

export const userResolvers = {
  Query: {
    homeowners: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canListHomeowners(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }
      return getHomeowners();
    },
  },
};
