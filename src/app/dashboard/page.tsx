import { redirect } from "next/navigation";
import { paths } from "~/config/paths";
import { getUserFromCookie } from "~/lib/auth";
import { getAuthenticatedRoute } from "~/lib/navigation";

export default async function Page() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect(paths.login.getHref());
  }

  redirect(getAuthenticatedRoute(user.role));
}
