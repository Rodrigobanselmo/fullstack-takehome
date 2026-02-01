import { DateTimeResolver } from "graphql-scalars";
import { authResolvers } from "./auth/auth.resolvers";
import { chatResolvers } from "./chat/chat.resolvers";
import { jobResolvers } from "./job/job.resolvers";
import { userResolvers } from "./user/user.resolvers";
import { subtaskResolvers } from "./subtask/subtask.resolvers";
import { recipeResolvers } from "./recipe/recipe.resolvers";

export const resolvers = {
  DateTime: DateTimeResolver,
  Mutation: {
    ...authResolvers.Mutation,
    ...jobResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...subtaskResolvers.Mutation,
    ...recipeResolvers.Mutation,
  },
  Query: {
    ...jobResolvers.Query,
    ...userResolvers.Query,
    ...chatResolvers.Query,
    ...subtaskResolvers.Query,
    ...recipeResolvers.Query,
  },
};
