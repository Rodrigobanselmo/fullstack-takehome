import { redirect } from "next/navigation";
import { getUserFromCookie } from "~/lib/auth";
import { canViewContractorDashboard } from "~/lib/authorization";

export default async function ContractorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (!user || !canViewContractorDashboard(user.role)) {
    redirect("/");
  }

  return children;
}
