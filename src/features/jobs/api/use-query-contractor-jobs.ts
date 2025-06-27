"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  ContractorJobsQuery,
  ContractorJobsQueryVariables,
  JobStatus,
} from "generated/gql/graphql";

const JOBS_QUERY = gql`
  query ContractorJobs($status: JobStatus) {
    jobs(status: $status) {
      id
      description
      location
      status
      cost
      homeowner {
        name
      }
    }
  }
`;

export function useQueryContractorJobs(status?: JobStatus | null) {
  return useQuery<ContractorJobsQuery, ContractorJobsQueryVariables>(
    JOBS_QUERY,
    {
      variables: { status },
    },
  );
}
