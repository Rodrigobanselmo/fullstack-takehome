import { UserRole } from "generated/gql/graphql";
import type { UserSession } from "./auth";

export const canManageJob = (user: UserSession | null) => {
  return user?.role === UserRole.Contractor;
};

export const canViewJobs = (user: UserSession | null) => {
  return (
    user?.role === UserRole.Contractor || user?.role === UserRole.Homeowner
  );
};

export const canListHomeowners = (user: UserSession | null) => {
  return user?.role === UserRole.Contractor;
};

export const canViewContractorDashboard = (role: UserRole) => {
  return role === UserRole.Contractor;
};

export const canViewHomeownerDashboard = (user: UserSession | null) => {
  return user?.role === UserRole.Homeowner;
};
