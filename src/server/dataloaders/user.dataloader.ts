import DataLoader from "dataloader";
import { prisma } from "~/server/database/prisma";
import type { User } from "generated/gql/graphql";

/**
 * DataLoader for batch loading users by ID
 * Prevents N+1 query problem when loading users
 */
export function createUserByIdLoader() {
  return new DataLoader<string, User | null>(async (userIds) => {
    // Fetch all users for the requested user IDs
    const users = await prisma.users.findMany({
      where: {
        id: { in: [...userIds] },
      },
    });

    // Create a map of userId -> User
    const userMap = new Map<string, User>();
    for (const user of users) {
      userMap.set(user.id, {
        id: user.id,
        name: user.name,
      });
    }

    // Return users in the same order as userIds
    // If a user is not found, return null
    return userIds.map((userId) => userMap.get(userId) ?? null);
  });
}
