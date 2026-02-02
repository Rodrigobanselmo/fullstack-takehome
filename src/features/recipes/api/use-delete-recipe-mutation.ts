"use client";

import { gql, useMutation } from "@apollo/client";
import type {
  DeleteRecipeMutation,
  DeleteRecipeMutationVariables,
} from "generated/gql/graphql";
import { RECIPES_QUERY } from "./use-query-recipes";

const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

export function useDeleteRecipeMutation() {
  return useMutation<DeleteRecipeMutation, DeleteRecipeMutationVariables>(
    DELETE_RECIPE_MUTATION,
    {
      refetchQueries: [{ query: RECIPES_QUERY }],
    },
  );
}
