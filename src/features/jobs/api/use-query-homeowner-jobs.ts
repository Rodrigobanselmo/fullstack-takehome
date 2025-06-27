"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  HomeownerJobsQuery,
  HomeownerJobsQueryVariables,
  JobStatus,
} from "generated/gql/graphql";

const HOMEOWNER_JOBS_QUERY = gql`
  query HomeownerJobs($status: JobStatus) {
    jobs(status: $status) {
      id
      description
      location
      status
      cost
      contractor {
        name
      }
    }
  }
`;

export function useQueryHomeownerJobs(status?: JobStatus | null) {
  return useQuery<HomeownerJobsQuery, HomeownerJobsQueryVariables>(
    HOMEOWNER_JOBS_QUERY,
    {
      variables: { status },
    },
  );
}
