"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  RecipeGroupQuery,
  RecipeGroupQueryVariables,
} from "generated/gql/graphql";

const RECIPE_GROUP_QUERY = gql`
  query RecipeGroup($id: ID!) {
    recipeGroup(id: $id) {
      id
      name
      description
      recipes {
        id
        name
        servings
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export function useQueryRecipeGroup(id: string) {
  return useQuery<RecipeGroupQuery, RecipeGroupQueryVariables>(
    RECIPE_GROUP_QUERY,
    {
      variables: { id },
      skip: !id,
    },
  );
}
