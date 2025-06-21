import { gql } from "graphql-tag";

export const jobTypeDefs = gql`
  enum JobStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  type User {
    username: String!
  }

  enum UserRole {
    CONTRACTOR
    HOMEOWNER
  }

  type Job {
    id: ID!
    description: String!
    location: String!
    status: JobStatus!
    cost: Float!
    contractorId: String!
    homeownerId: String
    homeowner: User
  }

  input CreateJobInput {
    description: String!
    location: String!
    status: JobStatus
    cost: Float!
    contractorId: String!
    homeownerId: String
  }

  type Query {
    jobs: [Job!]!
  }

  type Mutation {
    createJob(input: CreateJobInput!): Job!
  }
`;
