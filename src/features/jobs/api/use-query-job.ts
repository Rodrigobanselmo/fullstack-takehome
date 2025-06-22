"use client";

import { gql, useQuery } from "@apollo/client";
import type { JobQuery, JobQueryVariables } from "generated/gql/graphql";

const JOB_QUERY = gql`
  query Job($id: ID!) {
    job(id: $id) {
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

export function useQueryJob(id: string) {
  return useQuery<JobQuery, JobQueryVariables>(JOB_QUERY, {
    variables: { id },
    skip: !id,
  });
}
