"use client";

import { gql, useQuery } from "@apollo/client";
import type { HomeownerJobsQuery } from "generated/gql/graphql";

const HOMEOWNER_JOBS_QUERY = gql`
  query HomeownerJobs {
    jobs {
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

export function useQueryHomeownerJobs() {
  return useQuery<HomeownerJobsQuery>(HOMEOWNER_JOBS_QUERY);
}
