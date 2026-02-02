import { UserRole } from "generated/gql/graphql";
import type { UserSession } from "~/lib/auth";

export const canViewSubtasks = (user: UserSession | null) => {
  return (
    user?.role === UserRole.Contractor || user?.role === UserRole.Homeowner
  );
};

export const canManageSubtasks = (user: UserSession | null) => {
  return user?.role === UserRole.Contractor;
};
