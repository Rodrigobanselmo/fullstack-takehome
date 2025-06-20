import { authResolvers } from "./auth/auth.resolvers";

export const resolvers = {
  Mutation: {
    ...authResolvers.Mutation,
  },
  Query: {},
};
