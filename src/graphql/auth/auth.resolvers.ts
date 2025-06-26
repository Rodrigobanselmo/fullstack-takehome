import type {
  LoginOutput,
  LogoutOutput,
  MutationLoginArgs,
} from "generated/gql/graphql";
import { loginService, logoutService } from "./auth.services";
import { schemaValidation } from "~/lib/validation";
import { loginInputSchema } from "./auth.validators";
import { InvalidInputError } from "../errors";

export const authResolvers = {
  Mutation: {
    login: async (
      _: unknown,
      { input }: MutationLoginArgs,
    ): Promise<LoginOutput> => {
      const validation = schemaValidation(loginInputSchema, input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return loginService(validation.data);
    },

    logout: async (): Promise<LogoutOutput> => {
      return logoutService();
    },
  },
};
