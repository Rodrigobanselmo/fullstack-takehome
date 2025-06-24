import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
  }
  type Query {
    homeowners: [User!]!
  }
`;
