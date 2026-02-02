"use client";

import { gql, useQuery } from "@apollo/client";
import type {
  RecipeGroupQuery,
  RecipeGroupQueryVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUP_FORM_FRAGMENT } from "../components/recipe-group-form/recipe-group-form";

const RECIPE_GROUP_QUERY = gql`
  query RecipeGroup($id: ID!) {
    recipeGroup(id: $id) {
      id
      name
      ...RecipeGroupForm
    }
  }
  ${RECIPE_GROUP_FORM_FRAGMENT}
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
