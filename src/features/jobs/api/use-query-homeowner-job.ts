"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  HomeownerJobQuery,
  HomeownerJobQueryVariables,
} from "generated/gql/graphql";

const HOMEOWNER_JOB_QUERY = gql`
  query HomeownerJob($id: ID!) {
    job(id: $id) {
      id
      description
      location
      status
      cost
      contractor {
        id
        name
      }
      homeowner {
        id
      }
    }
  }
`;

export function useQueryHomeownerJob(id: string) {
  return useQuery<HomeownerJobQuery, HomeownerJobQueryVariables>(
    HOMEOWNER_JOB_QUERY,
    {
      variables: { id },
      skip: !id,
    },
  );
}
