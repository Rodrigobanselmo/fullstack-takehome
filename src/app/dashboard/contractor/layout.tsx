import { UserRole } from "generated/gql/graphql";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "~/lib/auth";

export default async function ContractorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  const isContractor = user && user.role === UserRole.Contractor;
  if (!isContractor) {
    redirect("/");
  }

  return children;
}
