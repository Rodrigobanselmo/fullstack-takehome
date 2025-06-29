import { gql, useMutation } from "@apollo/client";
import type {
  CreateSubtaskMutation,
  CreateSubtaskMutationVariables,
} from "generated/gql/graphql";
import { GET_SUBTASKS } from "./use-query-subtasks";

const CREATE_SUBTASK = gql`
  mutation CreateSubtask($input: CreateSubtaskInput!) {
    createSubtask(input: $input) {
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

export function useCreateSubtaskMutation() {
  return useMutation<CreateSubtaskMutation, CreateSubtaskMutationVariables>(
    CREATE_SUBTASK,
    {
      refetchQueries: [GET_SUBTASKS],
    },
  );
}
