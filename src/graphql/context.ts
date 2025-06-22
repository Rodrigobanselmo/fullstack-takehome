import type { NextApiRequest } from "next";
import { prisma } from "~/server/database/prisma";
import {
  type PasswordHasher,
  passwordHasher,
} from "~/server/utils/password-hasher";
import { type PrismaClient } from "../../generated/prisma";

export interface GraphQLContext {
  prisma: PrismaClient;
  passwordHasher: PasswordHasher;
  req: NextApiRequest;
}

export function createContext(req: NextApiRequest): GraphQLContext {
  return {
    req,
    prisma: prisma,
    passwordHasher: passwordHasher,
  };
}
