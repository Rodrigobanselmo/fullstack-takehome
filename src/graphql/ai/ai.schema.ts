import { gql } from "graphql-tag";

export const aiTypeDefs = gql`
  type AIThread {
    id: ID!
    title: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AIMessage {
    id: ID!
    threadId: ID!
    role: String!
    content: String!
    createdAt: DateTime!
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
    aiThreads: [AIThread!]!
    aiThread(id: ID!): AIThread
    aiThreadMessages(threadId: ID!): [AIMessage!]!
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
