import { gql } from "graphql-tag";

export const chatTypeDefs = gql`
  scalar DateTime

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

  type Conversation {
    id: ID!
    contractor: User!
    homeowner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input SendMessageInput {
    conversationId: ID!
    text: String!
  }

  type Query {
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!, first: Int, after: String): MessageConnection!
    conversationByParticipants(
      contractorId: ID!
      homeownerId: ID!
    ): Conversation
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): ID!
  }
`;
