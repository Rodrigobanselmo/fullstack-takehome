import { gql } from "graphql-tag";

export const chatTypeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    name: String!
  }

  type Message {
    id: ID!
    text: String!
    sender: User!
    createdAt: DateTime!
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }

  input SendMessageInput {
    conversationId: ID!
    text: String!
  }

  type Query {
    messages(conversationId: ID!, first: Int, after: String): MessageConnection!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): Message!
  }
`;
