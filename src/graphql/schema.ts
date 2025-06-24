import { gql } from "graphql-tag";
import { authTypeDefs } from "./auth/auth.schema";
import { jobTypeDefs } from "./job/job.schema";
import { userTypeDefs } from "./user/user.schema";

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [baseTypeDefs, authTypeDefs, jobTypeDefs, userTypeDefs];
