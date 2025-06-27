import type { NextApiRequest } from "next";
import { getUserFromCookie, type UserSession } from "~/lib/auth";

export interface GraphQLContext {
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
  };
}
