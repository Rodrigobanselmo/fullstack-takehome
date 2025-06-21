import { authResolvers } from "./auth/auth.resolvers";
import { jobResolvers } from "./job/job.resolvers";

export const resolvers = {
  Mutation: {
    ...authResolvers.Mutation,
    ...jobResolvers.Mutation,
  },
  Query: {
    ...jobResolvers.Query,
  },
};
