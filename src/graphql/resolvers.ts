import { authResolvers } from "./auth/auth.resolvers";
import { jobResolvers } from "./job/job.resolvers";
import { userResolvers } from "./user/user.resolvers";

export const resolvers = {
  Mutation: {
    ...authResolvers.Mutation,
    ...jobResolvers.Mutation,
  },
  Query: {
    ...jobResolvers.Query,
    ...userResolvers.Query,
  },
};
