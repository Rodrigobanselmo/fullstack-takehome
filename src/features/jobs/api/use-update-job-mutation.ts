"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  UpdateJobMutation,
  UpdateJobMutationVariables,
} from "generated/gql/graphql";

const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      description
      location
      status
      cost
      homeownerId
    }
  }
`;

export function useUpdateJobMutation() {
  return useMutation<UpdateJobMutation, UpdateJobMutationVariables>(
    UPDATE_JOB_MUTATION,
  );
}
