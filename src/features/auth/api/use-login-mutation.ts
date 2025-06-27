"use client";

import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import type {
  LoginMutation,
  LoginMutationVariables,
  UserRole,
} from "generated/gql/graphql";
import { getAuthenticatedRoute } from "~/lib/navigation";

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

  const handleRedirectAuthenticated = (role: UserRole) => {
    const dashboardRoute = getAuthenticatedRoute(role);
    router.push(dashboardRoute);
  };
  return useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION, {
    onCompleted: (data) => handleRedirectAuthenticated(data.login.role),
  });
}
