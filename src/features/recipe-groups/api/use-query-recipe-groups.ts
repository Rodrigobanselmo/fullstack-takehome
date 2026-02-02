"use client";

import { gql, useQuery } from "@apollo/client";
import type { RecipeGroupsQuery } from "generated/gql/graphql";

export const RECIPE_GROUPS_QUERY = gql`
  query RecipeGroups {
    recipeGroups {
      id
      name
      description
      recipes {
        id
        name
        servings
        tags
        overallRating
        prepTimeMinutes
      }
      createdAt
      updatedAt
    }
  }
`;

export function useQueryRecipeGroups() {
  return useQuery<RecipeGroupsQuery>(RECIPE_GROUPS_QUERY);
}
