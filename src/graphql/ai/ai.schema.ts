import { gql } from "graphql-tag";

export const aiTypeDefs = gql`
  type AIThread {
    id: ID!
    title: String!
    lastMessageAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AIThreadEdge {
    cursor: String!
    node: AIThread!
  }

  type AIThreadPageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type AIThreadConnection {
    edges: [AIThreadEdge!]!
    pageInfo: AIThreadPageInfo!
    totalCount: Int!
  }

  type AIMessage {
    id: ID!
    threadId: ID!
    role: String!
    content: String!
    toolName: String
    toolStatus: String
    createdAt: DateTime!
  }

  type AIMessageEdge {
    cursor: String!
    node: AIMessage!
  }

  type AIMessagePageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type AIMessageConnection {
    edges: [AIMessageEdge!]!
    pageInfo: AIMessagePageInfo!
    totalCount: Int!
  }

  input CreateAIThreadInput {
    title: String
  }

  input UpdateAIThreadInput {
    threadId: ID!
    title: String!
  }

  input SendAIThreadMessageInput {
    threadId: ID!
    message: String!
  }

  type SendAIThreadMessageResponse {
    message: AIMessage!
    response: AIMessage!
  }

  extend type Query {
    aiThreads(first: Int, after: String, search: String): AIThreadConnection!
    aiThread(id: ID!): AIThread
    aiThreadMessages(threadId: ID!, first: Int, before: String): AIMessageConnection!
  }

  extend type Mutation {
    createAIThread(input: CreateAIThreadInput): AIThread!
    updateAIThread(input: UpdateAIThreadInput!): AIThread
    deleteAIThread(id: ID!): Boolean!
    sendAIThreadMessage(
      input: SendAIThreadMessageInput!
    ): SendAIThreadMessageResponse!
  }
`;
