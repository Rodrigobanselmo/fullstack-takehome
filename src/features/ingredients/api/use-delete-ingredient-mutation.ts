"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  DeleteIngredientMutation,
  DeleteIngredientMutationVariables,
} from "generated/gql/graphql";
import {
  DEFAULT_INGREDIENTS_PAGE_SIZE,
  INGREDIENTS_QUERY,
} from "./use-query-ingredients";

const DELETE_INGREDIENT_MUTATION = gql`
  mutation DeleteIngredient($id: ID!) {
    deleteIngredient(id: $id)
  }
`;

export function useDeleteIngredientMutation() {
  return useMutation<
    DeleteIngredientMutation,
    DeleteIngredientMutationVariables
  >(DELETE_INGREDIENT_MUTATION, {
    refetchQueries: [
      {
        query: INGREDIENTS_QUERY,
        variables: { first: DEFAULT_INGREDIENTS_PAGE_SIZE },
      },
    ],
  });
}
