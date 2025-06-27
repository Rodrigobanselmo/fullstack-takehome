import { DateTimeResolver } from "graphql-scalars";
import { authResolvers } from "./auth/auth.resolvers";
import { chatResolvers } from "./chat/chat.resolvers";
import { jobResolvers } from "./job/job.resolvers";
import { userResolvers } from "./user/user.resolvers";

export const resolvers = {
  DateTime: DateTimeResolver,
  Mutation: {
    ...authResolvers.Mutation,
    ...jobResolvers.Mutation,
    ...chatResolvers.Mutation,
  },
  Query: {
    ...jobResolvers.Query,
    ...userResolvers.Query,
    ...chatResolvers.Query,
  },
};
