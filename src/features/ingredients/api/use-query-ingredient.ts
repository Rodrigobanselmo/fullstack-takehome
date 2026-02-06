"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  IngredientQuery,
  IngredientQueryVariables,
} from "generated/gql/graphql";

const INGREDIENT_QUERY = gql`
  query Ingredient($id: ID!) {
    ingredient(id: $id) {
      id
      name
      description
      categories
      defaultUnit
      averagePrice
      priceUnit
      priceCurrency
      userId
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export function useQueryIngredient(id: string) {
  return useQuery<IngredientQuery, IngredientQueryVariables>(INGREDIENT_QUERY, {
    variables: { id },
    skip: !id,
  });
}
