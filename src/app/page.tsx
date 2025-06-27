import { redirect } from "next/navigation";
import { paths } from "~/config/paths";

export default function Page() {
  redirect(paths.login.getHref());
}
