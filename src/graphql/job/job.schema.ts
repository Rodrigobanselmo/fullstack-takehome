import { gql } from "graphql-tag";

export const jobTypeDefs = gql`
  enum JobStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  type User {
    id: ID!
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
    homeownerId: String
  }

  input UpdateJobInput {
    description: String!
    location: String!
    status: JobStatus
    cost: Float!
    homeownerId: String
  }

  type Query {
    jobs: [Job!]!
    job(id: ID!): Job
    homeowners: [User!]!
  }

  type Mutation {
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
  }
`;
