import { redirect } from "next/navigation";
import { getUserFromCookie } from "~/lib/auth";
import { getAuthenticatedRoute } from "~/lib/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (user) {
    const dashboardRoute = getAuthenticatedRoute(user.role);
    redirect(dashboardRoute);
  }

  return children;
}
