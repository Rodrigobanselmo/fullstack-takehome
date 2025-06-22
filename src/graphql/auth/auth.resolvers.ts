import type { LoginInput, LoginOutput, UserRole } from "generated/gql/graphql";
import { clearUserCookie, setUserCookie } from "~/lib/auth";
import type { GraphQLContext } from "../context";
import { invalidCredentialsError } from "./auth.errors";

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
        throw invalidCredentialsError();
      }

      const isPasswordCorrect = await context.passwordHasher.compare(
        input.plainTextPassword,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw invalidCredentialsError();
      }

      const userSession = {
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
      };

      // Set user cookie
      await setUserCookie(userSession);

      return userSession;
    },

    logout: async (): Promise<{ success: boolean }> => {
      // Clear user cookie
      await clearUserCookie();

      return { success: true };
    },
  },
};
