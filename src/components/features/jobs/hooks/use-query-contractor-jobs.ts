import { gql, useQuery } from "@apollo/client";
import type { JobsQuery } from "generated/gql/graphql";

const JOBS_QUERY = gql`
  query Jobs {
    jobs {
      id
      description
      location
      status
      cost
      homeowner {
        username
      }
    }
  }
`;

export function useQueryContractorJobs() {
  return useQuery<JobsQuery>(JOBS_QUERY);
}
