import type { LoginInput, LoginOutput } from "generated/gql/graphql";
import { loginService, logoutService } from "./auth.services";

export const authResolvers = {
  Mutation: {
    login: async (
      _: unknown,
      { input }: { input: LoginInput },
    ): Promise<LoginOutput> => {
      return loginService(input);
    },

    logout: async (): Promise<{ success: boolean }> => {
      return logoutService();
    },
  },
};
