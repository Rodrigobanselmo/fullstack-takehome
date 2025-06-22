import { UserRole } from "generated/gql/graphql";
import { paths } from "~/config/paths";

export const getAuthenticatedRoute = (role: UserRole) => {
  const isContractor = role === UserRole.Contractor;
  const dashboardRoute = isContractor
    ? paths.dashboard.contractor.getHref()
    : paths.dashboard.homeowner.getHref();

  return dashboardRoute;
};
