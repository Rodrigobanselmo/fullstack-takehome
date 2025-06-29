import { gql, useMutation } from "@apollo/client";
import type {
  DeleteSubtaskMutation,
  DeleteSubtaskMutationVariables,
} from "generated/gql/graphql";
import { GET_SUBTASKS } from "./use-query-subtasks";

const DELETE_SUBTASK = gql`
  mutation DeleteSubtask($id: ID!, $jobId: ID!) {
    deleteSubtask(id: $id, jobId: $jobId)
  }
`;

export function useDeleteSubtaskMutation() {
  return useMutation<DeleteSubtaskMutation, DeleteSubtaskMutationVariables>(
    DELETE_SUBTASK,
    {
      refetchQueries: [GET_SUBTASKS],
    },
  );
}
