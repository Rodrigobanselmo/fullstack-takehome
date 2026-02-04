import { gql } from "graphql-tag";

export const aiTypeDefs = gql`
  type AIChatMessage {
    role: String!
    content: String!
  }

  input AIChatMessageInput {
    role: String!
    content: String!
  }

  input SendAIMessageInput {
    message: String!
    history: [AIChatMessageInput!]
  }

  type AIChatResponse {
    response: String!
    messages: [AIChatMessage!]!
  }

  extend type Mutation {
    sendAIMessage(input: SendAIMessageInput!): AIChatResponse!
  }
`;

