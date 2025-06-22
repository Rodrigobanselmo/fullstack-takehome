import type { NextApiRequest } from "next";
import { prisma } from "~/server/database/prisma";
import {
  type PasswordHasher,
  passwordHasher,
} from "~/server/utils/password-hasher";
import { type PrismaClient } from "../../generated/prisma";
import { getUserFromCookie, type UserSession } from "~/lib/auth";

export interface GraphQLContext {
  prisma: PrismaClient;
  passwordHasher: PasswordHasher;
  req: NextApiRequest;
  user: UserSession | null;
}

export async function createContext(
  req: NextApiRequest,
): Promise<GraphQLContext> {
  const user = await getUserFromCookie();

  return {
    req,
    user,
    prisma: prisma,
    passwordHasher: passwordHasher,
  };
}
