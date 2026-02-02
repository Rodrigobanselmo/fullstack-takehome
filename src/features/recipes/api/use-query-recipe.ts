"use client";

import { gql, useQuery } from "@apollo/client";
import type { RecipeQuery, RecipeQueryVariables } from "generated/gql/graphql";
import { RECIPE_VIEW_FRAGMENT } from "../components/recipe-view/recipe-view";
import { RECIPE_FORM_FRAGMENT } from "../components/recipe-form/recipe-form";

const RECIPE_QUERY = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
      id
      name
      ...RecipeView
      ...RecipeForm
    }
  }
  ${RECIPE_VIEW_FRAGMENT}
  ${RECIPE_FORM_FRAGMENT}
`;

export function useQueryRecipe(id: string) {
  return useQuery<RecipeQuery, RecipeQueryVariables>(RECIPE_QUERY, {
    variables: { id },
    skip: !id,
  });
}
