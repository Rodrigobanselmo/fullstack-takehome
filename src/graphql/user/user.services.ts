import type { User } from "generated/gql/graphql";
import { UserRole } from "generated/gql/graphql";
import { userRepository } from "~/server/repositories/user.repository";

export async function getHomeowners(): Promise<User[]> {
  return userRepository.findManyByRole(UserRole.Homeowner);
}
