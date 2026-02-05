"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  IngredientsQuery,
  IngredientsQueryVariables,
} from "generated/gql/graphql";

export const INGREDIENTS_QUERY = gql`
  query Ingredients($first: Int, $after: String) {
    ingredients(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          description
          category
          defaultUnit
          averagePrice
          priceUnit
          priceCurrency
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const DEFAULT_INGREDIENTS_PAGE_SIZE = 50;

export function useQueryIngredients(first?: number, after?: string) {
  return useQuery<IngredientsQuery, IngredientsQueryVariables>(
    INGREDIENTS_QUERY,
    {
      variables: {
        first: first ?? DEFAULT_INGREDIENTS_PAGE_SIZE,
        after,
      },
    },
  );
}
