"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  UpdateIngredientMutation,
  UpdateIngredientMutationVariables,
} from "generated/gql/graphql";
import { INGREDIENTS_QUERY } from "./use-query-ingredients";

const UPDATE_INGREDIENT_MUTATION = gql`
  mutation UpdateIngredient($id: ID!, $input: UpdateIngredientInput!) {
    updateIngredient(id: $id, input: $input) {
      id
      name
      description
      category
      defaultUnit
      averagePrice
      priceUnit
      priceCurrency
      userId
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
    refetchQueries: [{ query: INGREDIENTS_QUERY }],
  });
}
