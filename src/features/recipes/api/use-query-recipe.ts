"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  RecipeQuery,
  RecipeQueryVariables,
} from "generated/gql/graphql";

const RECIPE_QUERY = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
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

export function useQueryRecipe(id: string) {
  return useQuery<RecipeQuery, RecipeQueryVariables>(RECIPE_QUERY, {
    variables: { id },
    skip: !id,
  });
}

