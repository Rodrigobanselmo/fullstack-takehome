"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  RemoveRecipesFromGroupMutation,
  RemoveRecipesFromGroupMutationVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUPS_QUERY } from "./use-query-recipe-groups";

const REMOVE_RECIPES_FROM_GROUP_MUTATION = gql`
  mutation RemoveRecipesFromGroup($input: RemoveRecipesFromGroupInput!) {
    removeRecipesFromGroup(input: $input) {
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

export function useRemoveRecipesFromGroupMutation() {
  return useMutation<
    RemoveRecipesFromGroupMutation,
    RemoveRecipesFromGroupMutationVariables
  >(REMOVE_RECIPES_FROM_GROUP_MUTATION, {
    refetchQueries: [{ query: RECIPE_GROUPS_QUERY }],
  });
}

