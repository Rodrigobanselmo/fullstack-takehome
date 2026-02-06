"use client";

import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import type {
  LoginMutation,
  LoginMutationVariables,
} from "generated/gql/graphql";
import { paths } from "~/config/paths";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      username
      role
    }
  }
`;

export function useLoginMutation() {
  const router = useRouter();

  return useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION, {
    onCompleted: () => router.push(paths.dashboard.chat.getHref()),
  });
}
