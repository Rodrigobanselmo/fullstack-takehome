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

  type Job {
    id: ID!
    description: String!
    location: String!
    status: JobStatus!
    cost: Float!
    contractor: User!
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
    jobs(status: JobStatus): [Job!]!
    job(id: ID!): Job!
  }

  type Mutation {
    createJob(input: CreateJobInput!): ID!
    updateJob(id: ID!, input: UpdateJobInput!): ID!
    deleteJob(id: ID!): ID!
  }
`;
