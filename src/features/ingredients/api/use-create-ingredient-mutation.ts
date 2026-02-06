"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  CreateIngredientMutation,
  CreateIngredientMutationVariables,
} from "generated/gql/graphql";
import {
  DEFAULT_INGREDIENTS_PAGE_SIZE,
  INGREDIENTS_QUERY,
} from "./use-query-ingredients";

const CREATE_INGREDIENT_MUTATION = gql`
  mutation CreateIngredient($input: CreateIngredientInput!) {
    createIngredient(input: $input) {
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

export function useCreateIngredientMutation() {
  return useMutation<
    CreateIngredientMutation,
    CreateIngredientMutationVariables
  >(CREATE_INGREDIENT_MUTATION, {
    refetchQueries: [
      {
        query: INGREDIENTS_QUERY,
        variables: { first: DEFAULT_INGREDIENTS_PAGE_SIZE },
      },
    ],
  });
}
