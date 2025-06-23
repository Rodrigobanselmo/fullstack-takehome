"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  DeleteJobMutation,
  DeleteJobMutationVariables,
} from "generated/gql/graphql";

const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      id
      description
      location
      status
      cost
      homeownerId
    }
  }
`;

export function useDeleteJobMutation() {
  return useMutation<DeleteJobMutation, DeleteJobMutationVariables>(
    DELETE_JOB_MUTATION,
  );
}
