import { redirect } from "next/navigation";
import { paths } from "~/config/paths";
import { getUserFromCookie } from "~/lib/auth";

export default async function Page() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect(paths.login.getHref());
  }

  redirect(paths.dashboard.chat.getHref());
}
