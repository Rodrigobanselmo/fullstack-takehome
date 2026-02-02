"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  CreateRecipeMutation,
  CreateRecipeMutationVariables,
} from "generated/gql/graphql";
import { RECIPES_QUERY } from "./use-query-recipes";

const CREATE_RECIPE_MUTATION = gql`
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
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

export function useCreateRecipeMutation() {
  return useMutation<CreateRecipeMutation, CreateRecipeMutationVariables>(
    CREATE_RECIPE_MUTATION,
    {
      refetchQueries: [{ query: RECIPES_QUERY }],
    },
  );
}
