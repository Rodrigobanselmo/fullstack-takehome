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
    name: String!
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
    homeowner: User!
  }

  input CreateJobInput {
    description: String!
    location: String!
    status: JobStatus
    cost: Float!
    homeownerId: String!
  }

  input UpdateJobInput {
    description: String!
    location: String!
    status: JobStatus
    cost: Float!
    homeownerId: String!
  }

  type Query {
    jobs: [Job!]!
    job(id: ID!): Job!
    homeowners: [User!]!
  }

  type Mutation {
    createJob(input: CreateJobInput!): ID!
    updateJob(id: ID!, input: UpdateJobInput!): ID!
    deleteJob(id: ID!): ID!
  }
`;
