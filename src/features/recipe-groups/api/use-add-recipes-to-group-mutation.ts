"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  AddRecipesToGroupMutation,
  AddRecipesToGroupMutationVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUPS_QUERY } from "./use-query-recipe-groups";

const ADD_RECIPES_TO_GROUP_MUTATION = gql`
  mutation AddRecipesToGroup($input: AddRecipesToGroupInput!) {
    addRecipesToGroup(input: $input) {
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

export function useAddRecipesToGroupMutation() {
  return useMutation<
    AddRecipesToGroupMutation,
    AddRecipesToGroupMutationVariables
  >(ADD_RECIPES_TO_GROUP_MUTATION, {
    refetchQueries: [{ query: RECIPE_GROUPS_QUERY }],
  });
}

