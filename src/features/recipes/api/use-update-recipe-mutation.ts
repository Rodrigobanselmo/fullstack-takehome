"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  UpdateRecipeMutation,
  UpdateRecipeMutationVariables,
} from "generated/gql/graphql";
import { RECIPES_QUERY } from "./use-query-recipes";

const UPDATE_RECIPE_MUTATION = gql`
  mutation UpdateRecipe($id: ID!, $input: UpdateRecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      id
      name
      servings
      tags
      overallRating
      prepTimeMinutes
      ingredients {
        id
        ingredientId
        quantity
        unit
        notes
        optional
        ingredient {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export function useUpdateRecipeMutation() {
  return useMutation<UpdateRecipeMutation, UpdateRecipeMutationVariables>(
    UPDATE_RECIPE_MUTATION,
    {
      refetchQueries: [{ query: RECIPES_QUERY }],
    },
  );
}

