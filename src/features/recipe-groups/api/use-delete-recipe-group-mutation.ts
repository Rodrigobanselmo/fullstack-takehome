"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  DeleteRecipeGroupMutation,
  DeleteRecipeGroupMutationVariables,
} from "generated/gql/graphql";
import { RECIPE_GROUPS_QUERY } from "./use-query-recipe-groups";

const DELETE_RECIPE_GROUP_MUTATION = gql`
  mutation DeleteRecipeGroup($id: ID!) {
    deleteRecipeGroup(id: $id)
  }
`;

export function useDeleteRecipeGroupMutation() {
  return useMutation<
    DeleteRecipeGroupMutation,
    DeleteRecipeGroupMutationVariables
  >(DELETE_RECIPE_GROUP_MUTATION, {
    refetchQueries: [{ query: RECIPE_GROUPS_QUERY }],
  });
}
