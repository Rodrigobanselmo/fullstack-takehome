"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  UpdateRecipeGroupMutation,
  UpdateRecipeGroupMutationVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUPS_QUERY } from "./use-query-recipe-groups";

const UPDATE_RECIPE_GROUP_MUTATION = gql`
  mutation UpdateRecipeGroup($id: ID!, $input: UpdateRecipeGroupInput!) {
    updateRecipeGroup(id: $id, input: $input) {
      id
      name
      description
      recipes {
        id
        name
        servings
      }
      createdAt
      updatedAt
    }
  }
`;

export function useUpdateRecipeGroupMutation() {
  return useMutation<
    UpdateRecipeGroupMutation,
    UpdateRecipeGroupMutationVariables
  >(UPDATE_RECIPE_GROUP_MUTATION, {
    refetchQueries: [{ query: RECIPE_GROUPS_QUERY }],
  });
}
