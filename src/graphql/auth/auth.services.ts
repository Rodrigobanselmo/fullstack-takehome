import type { LoginInput, LoginOutput, UserRole } from "generated/gql/graphql";
import { setUserCookie, clearUserCookie } from "~/lib/auth";
import { prisma } from "~/server/database/prisma";
import { passwordHasher } from "~/server/utils/password-hasher";
import { invalidCredentialsError } from "../auth/auth.errors";

export async function loginService(input: LoginInput): Promise<LoginOutput> {
  const user = await prisma.user.findFirst({
    where: {
      username: input.username,
    },
  });

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

export async function logoutService(): Promise<{ success: boolean }> {
  await clearUserCookie();
  return { success: true };
}
