import { UserRole } from "generated/gql/graphql";
import type { UserSession } from "./auth";

// Dashboard authorization functions
export const canViewContractorDashboard = (role: UserRole) => {
  return role === UserRole.Contractor;
};

export const canViewHomeownerDashboard = (user: UserSession | null) => {
  return user?.role === UserRole.Homeowner;
};
