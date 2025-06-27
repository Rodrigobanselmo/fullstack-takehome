import type { User } from "generated/gql/graphql";
import { UserRole } from "generated/prisma";
import { prisma } from "~/server/database/prisma";

export async function getHomeowners(): Promise<User[]> {
  return prisma.user.findMany({
    where: { role: UserRole.HOMEOWNER },
  });
}
