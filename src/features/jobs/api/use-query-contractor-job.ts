"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  ContractorJobQuery,
  ContractorJobQueryVariables,
} from "generated/gql/graphql";

const CONTRACTOR_JOB_QUERY = gql`
  query ContractorJob($id: ID!) {
    job(id: $id) {
      id
      description
      location
      status
      cost
      homeowner {
        id
        name
      }
    }
  }
`;

export function useQueryContractorJob(id: string) {
  return useQuery<ContractorJobQuery, ContractorJobQueryVariables>(
    CONTRACTOR_JOB_QUERY,
    {
      variables: { id },
      skip: !id,
    },
  );
}
