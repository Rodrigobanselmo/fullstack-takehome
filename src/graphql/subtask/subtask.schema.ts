import { gql } from "graphql-tag";

export const subtaskSchema = gql`
  scalar DateTime

  type Subtask {
    id: ID!
    description: String!
    deadline: DateTime
    cost: Float!
    status: SubtaskStatus!
    jobId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
  }

  enum SubtaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  input CreateSubtaskInput {
    description: String!
    deadline: DateTime
    cost: Float!
    status: SubtaskStatus!
    jobId: ID!
  }

  input UpdateSubtaskInput {
    description: String
    deadline: DateTime
    cost: Float
    status: SubtaskStatus
  }

  type Query {
    subtasks(jobId: ID!): [Subtask!]!
    subtask(id: ID!, jobId: ID!): Subtask
  }

  type Mutation {
    createSubtask(input: CreateSubtaskInput!): Subtask!
    updateSubtask(id: ID!, jobId: ID!, input: UpdateSubtaskInput!): Subtask!
    deleteSubtask(id: ID!, jobId: ID!): Boolean!
  }
`;
