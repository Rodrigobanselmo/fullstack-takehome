import { ApolloServerErrorCode } from "@apollo/server/errors";
import type { LoginInput, LoginOutput, UserRole } from "generated/gql/graphql";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../context";

export const authResolvers = {
  Mutation: {
    login: async (
      _: unknown,
      { input }: { input: LoginInput },
      context: GraphQLContext,
    ): Promise<LoginOutput> => {
      const user = await context.prisma.user.findFirst({
        where: {
          username: input.username,
        },
      });

      if (!user) {
        throw new GraphQLError("Invalid username or password.", {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
        });
      }

      const isPasswordCorrect = await context.passwordHasher.compare(
        input.plainTextPassword,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw new GraphQLError("Invalid username or password.", {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
        });
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
      };
    },
  },
};
