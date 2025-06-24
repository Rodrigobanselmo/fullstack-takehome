import { UserRole } from "generated/prisma";
import { prisma } from "~/server/database/prisma";

export async function getHomeowners() {
  return prisma.user.findMany({
    where: { role: UserRole.HOMEOWNER },
    select: { id: true, name: true },
  });
}
