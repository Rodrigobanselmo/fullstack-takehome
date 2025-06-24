"use client";

import { gql, useQuery } from "@apollo/client";
import type { ContractorJobsQuery } from "generated/gql/graphql";

const JOBS_QUERY = gql`
  query ContractorJobs {
    jobs {
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

export function useQueryContractorJobs() {
  return useQuery<ContractorJobsQuery>(JOBS_QUERY);
}
