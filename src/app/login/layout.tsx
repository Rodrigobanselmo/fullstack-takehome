import { redirect } from "next/navigation";
import { paths } from "~/config/paths";
import { getUserFromCookie } from "~/lib/auth";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (user) {
    redirect(paths.dashboard.chat.getHref());
  }

  return children;
}
