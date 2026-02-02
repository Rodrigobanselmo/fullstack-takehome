import { UserRole } from "generated/gql/graphql";
import type { UserSession } from "~/lib/auth";

export const canManageJob = (user: UserSession | null) => {
  return user?.role === UserRole.Contractor;
};

export const canViewJobs = (user: UserSession | null) => {
  return (
    user?.role === UserRole.Contractor || user?.role === UserRole.Homeowner
  );
};
