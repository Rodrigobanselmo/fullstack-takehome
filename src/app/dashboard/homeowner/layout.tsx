import { UserRole } from "generated/gql/graphql";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "~/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  const isHomeowner = user && user.role === UserRole.Homeowner;
  if (!isHomeowner) {
    redirect("/");
  }

  return children;
}
