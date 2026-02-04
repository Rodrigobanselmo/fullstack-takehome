import type { GraphQLContext } from "../context";

export function canUseAI(user: GraphQLContext["user"]): boolean {
  return user !== null;
}

