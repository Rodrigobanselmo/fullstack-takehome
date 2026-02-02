"use client";

import { gql, useQuery } from "@apollo/client";
import type { IngredientsQuery } from "generated/gql/graphql";

export const INGREDIENTS_QUERY = gql`
  query Ingredients {
    ingredients {
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
`;

export function useQueryIngredients() {
  return useQuery<IngredientsQuery>(INGREDIENTS_QUERY);
}

