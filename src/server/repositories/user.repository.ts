import { prisma } from "~/server/database/prisma";
import type { User, UserRole as GraphQLUserRole } from "generated/gql/graphql";
import type { UserRole, users as PrismaUser } from "generated/prisma";

class PrismaUserRepository {
  async findManyByRole(role: GraphQLUserRole): Promise<User[]> {
    const users = await prisma.users.findMany({
      where: { role: role.toLowerCase() as UserRole },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
  }

  async findByUsername(username: string): Promise<PrismaUser | null> {
    return prisma.users.findFirst({
      where: { username },
    });
  }
}

export const userRepository = new PrismaUserRepository();
