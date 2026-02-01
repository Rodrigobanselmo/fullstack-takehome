import { UserRole } from "generated/gql/graphql";
import type { UserSession } from "~/lib/auth";

export const canListHomeowners = (user: UserSession | null) => {
  return user?.role === UserRole.Contractor;
};

