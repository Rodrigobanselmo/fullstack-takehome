import type {
  LoginInput,
  LoginOutput,
  LogoutOutput,
  UserRole,
} from "generated/gql/graphql";
import { setUserCookie, clearUserCookie } from "~/lib/auth";
import { userRepository } from "~/server/repositories/user.repository";
import { passwordHasher } from "~/server/utils/password-hasher";
import { invalidCredentialsError } from "../auth/auth.errors";

export async function loginService(input: LoginInput): Promise<LoginOutput> {
  const user = await userRepository.findByUsername(input.username);

  if (!user) {
    throw invalidCredentialsError();
  }

  const isPasswordCorrect = await passwordHasher.compare(
    input.plainTextPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw invalidCredentialsError();
  }

  const userSession = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
  };

  await setUserCookie(userSession);

  return userSession;
}

export async function logoutService(): Promise<LogoutOutput> {
  await clearUserCookie();
  return { success: true };
}
