import { gql, useMutation } from "@apollo/client";
import type {
  UpdateSubtaskMutation,
  UpdateSubtaskMutationVariables,
} from "generated/gql/graphql";
import { GET_SUBTASKS } from "./use-query-subtasks";

const UPDATE_SUBTASK = gql`
  mutation UpdateSubtask($id: ID!, $jobId: ID!, $input: UpdateSubtaskInput!) {
    updateSubtask(id: $id, jobId: $jobId, input: $input) {
      id
      description
      deadline
      cost
      status
      jobId
      createdAt
      updatedAt
    }
  }
`;

export function useUpdateSubtaskMutation() {
  return useMutation<UpdateSubtaskMutation, UpdateSubtaskMutationVariables>(
    UPDATE_SUBTASK,
    {
      refetchQueries: [GET_SUBTASKS],
    },
  );
}
