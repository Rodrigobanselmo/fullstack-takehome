"use client";

import { gql, useQuery } from "@apollo/client";
import type { HomeownersQuery } from "generated/gql/graphql";

const HOMEOWNERS_QUERY = gql`
  query Homeowners {
    homeowners {
      id
      username
    }
  }
`;

export function useQueryHomeowners() {
  return useQuery<HomeownersQuery>(HOMEOWNERS_QUERY);
}
