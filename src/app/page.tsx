"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import styles from "./index.module.css";
import InputField from "../components/forms/input-field/input-field";
import SubmitButton from "../components/forms/submit-button/submit-button";
import FormError from "../components/alerts/form-error";
import {
  UserRole,
  type LoginMutation,
  type LoginMutationVariables,
} from "../../generated/gql/graphql";
import { ROUTES } from "~/constants/routes";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      username
      role
    }
  }
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [login, { loading, error }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN_MUTATION, { onCompleted: handleLoginSuccess });

  function handleLoginSuccess(data: LoginMutation) {
    const isContractor = data.login.role === UserRole.Contractor;
    const dashboardRoute = isContractor
      ? ROUTES.DASHBOARD.CONTRACTOR
      : ROUTES.DASHBOARD.HOMEOWNER;

    router.push(dashboardRoute);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login({
      variables: {
        input: {
          username: username,
          plainTextPassword: password,
        },
      },
    });
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h2 className={styles.title}>Sign in to your account</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Enter your username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <FormError error={error?.message} />
          <SubmitButton isLoading={loading}>Sign in</SubmitButton>
        </form>
      </div>
    </div>
  );
}
