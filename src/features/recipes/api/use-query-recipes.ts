"use client";

import { gql, useQuery } from "@apollo/client";
import type { RecipesQuery } from "generated/gql/graphql";

export const RECIPES_QUERY = gql`
  query Recipes {
    recipes {
      id
      name
      servings
      tags
      overallRating
      prepTimeMinutes
      image {
        id
        url
        filename
      }
      createdAt
      updatedAt
    }
  }
`;

export function useQueryRecipes() {
  return useQuery<RecipesQuery>(RECIPES_QUERY);
}
