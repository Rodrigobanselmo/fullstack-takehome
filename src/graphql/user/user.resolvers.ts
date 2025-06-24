import { UserRole } from "generated/prisma";
import { canListHomeowners } from "~/lib/authorization";
import { prisma } from "~/server/database/prisma";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";

export const userResolvers = {
  Query: {
    homeowners: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canListHomeowners(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return prisma.user.findMany({
        where: {
          role: UserRole.HOMEOWNER,
        },
        select: {
          id: true,
          name: true,
        },
      });
    },
  },
};
