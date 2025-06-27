import { type UserRole } from "generated/gql/graphql";
import { paths } from "~/config/paths";
import { canViewContractorDashboard } from "./authorization";

export const getAuthenticatedRoute = (role: UserRole) => {
  const dashboardRoute = canViewContractorDashboard(role)
    ? paths.dashboard.contractor.getHref()
    : paths.dashboard.homeowner.getHref();

  return dashboardRoute;
};
