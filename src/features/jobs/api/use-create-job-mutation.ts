"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  CreateJobMutation,
  CreateJobMutationVariables,
} from "generated/gql/graphql";

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      description
      location
      status
      cost
      homeownerId
    }
  }
`;

export function useCreateJobMutation() {
  return useMutation<CreateJobMutation, CreateJobMutationVariables>(
    CREATE_JOB_MUTATION,
  );
}
