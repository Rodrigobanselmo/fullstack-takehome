import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import type {
  GetSubtasksQuery,
  GetSubtasksQueryVariables,
} from "generated/gql/graphql";

export const GET_SUBTASKS = gql`
  query GetSubtasks($jobId: ID!) {
    subtasks(jobId: $jobId) {
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

export function useQuerySubtasks(jobId: string) {
  return useQuery<GetSubtasksQuery, GetSubtasksQueryVariables>(GET_SUBTASKS, {
    variables: { jobId },
    skip: !jobId,
  });
}
