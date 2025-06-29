import { gql } from "graphql-tag";
import { authTypeDefs } from "./auth/auth.schema";
import { chatTypeDefs } from "./chat/chat.schema";
import { jobTypeDefs } from "./job/job.schema";
import { userTypeDefs } from "./user/user.schema";
import { subtaskSchema } from "./subtask/subtask.schema";

const baseTypeDefs = gql`
  scalar DateTime

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  chatTypeDefs,
  jobTypeDefs,
  userTypeDefs,
  subtaskSchema,
];
