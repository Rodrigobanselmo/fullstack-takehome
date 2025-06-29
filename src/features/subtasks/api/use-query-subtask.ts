import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import type {
  GetSubtaskQuery,
  GetSubtaskQueryVariables,
} from "generated/gql/graphql";

export const GET_SUBTASK = gql`
  query GetSubtask($id: ID!, $jobId: ID!) {
    subtask(id: $id, jobId: $jobId) {
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

export function useQuerySubtask(id: string, jobId: string) {
  return useQuery<GetSubtaskQuery, GetSubtaskQueryVariables>(GET_SUBTASK, {
    variables: { id, jobId },
    skip: !id || !jobId,
  });
}
