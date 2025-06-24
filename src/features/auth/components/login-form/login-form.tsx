"use client";

import { useState } from "react";
import Button from "~/components/ui/button/button";
import FormError from "~/components/ui/forms/form-error/form-error";
import TextField from "~/components/ui/forms/text-field/text-field";
import { useLoginMutation } from "../../api/use-login-mutation";
import styles from "./login-form.module.css";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, { loading, error }] = useLoginMutation();

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        required
        placeholder="Enter your username"
        value={username}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Enter your password"
        value={password}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => setPassword(e.target.value)}
      />
      <FormError error={error?.message} />

      <Button
        type="submit"
        size="lg"
        variant="fill"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
