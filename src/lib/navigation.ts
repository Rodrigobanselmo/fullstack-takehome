import { UserRole } from "generated/gql/graphql";
import { ROUTES } from "~/constants/routes";

export const getAuthenticatedRoute = (role: UserRole) => {
  const isContractor = role === UserRole.Contractor;
  const dashboardRoute = isContractor
    ? ROUTES.DASHBOARD.CONTRACTOR.ROOT
    : ROUTES.DASHBOARD.HOMEOWNER.ROOT;

  return dashboardRoute;
};
