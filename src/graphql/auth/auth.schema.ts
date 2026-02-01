import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  enum UserRole {
    contractor
    homeowner
  }

  type LoginOutput {
    id: ID!
    username: String!
    role: UserRole!
  }

  type LogoutOutput {
    success: Boolean!
  }

  input LoginInput {
    username: String!
    plainTextPassword: String!
  }

  type Mutation {
    login(input: LoginInput!): LoginOutput!
    logout: LogoutOutput!
  }
`;
