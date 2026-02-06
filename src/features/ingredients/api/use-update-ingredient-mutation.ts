"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  UpdateIngredientMutation,
  UpdateIngredientMutationVariables,
} from "generated/gql/graphql";
import {
  DEFAULT_INGREDIENTS_PAGE_SIZE,
  INGREDIENTS_QUERY,
} from "./use-query-ingredients";

const UPDATE_INGREDIENT_MUTATION = gql`
  mutation UpdateIngredient($id: ID!, $input: UpdateIngredientInput!) {
    updateIngredient(id: $id, input: $input) {
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

export function useUpdateIngredientMutation() {
  return useMutation<
    UpdateIngredientMutation,
    UpdateIngredientMutationVariables
  >(UPDATE_INGREDIENT_MUTATION, {
    refetchQueries: [
      {
        query: INGREDIENTS_QUERY,
        variables: { first: DEFAULT_INGREDIENTS_PAGE_SIZE },
      },
    ],
  });
}
