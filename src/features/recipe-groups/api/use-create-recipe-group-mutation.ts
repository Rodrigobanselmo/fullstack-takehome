"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  CreateRecipeGroupMutation,
  CreateRecipeGroupMutationVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUPS_QUERY } from "./use-query-recipe-groups";

const CREATE_RECIPE_GROUP_MUTATION = gql`
  mutation CreateRecipeGroup($input: CreateRecipeGroupInput!) {
    createRecipeGroup(input: $input) {
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

export function useCreateRecipeGroupMutation() {
  return useMutation<
    CreateRecipeGroupMutation,
    CreateRecipeGroupMutationVariables
  >(CREATE_RECIPE_GROUP_MUTATION, {
    refetchQueries: [{ query: RECIPE_GROUPS_QUERY }],
  });
}

