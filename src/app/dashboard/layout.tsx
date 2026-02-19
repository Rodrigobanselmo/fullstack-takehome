import { redirect } from "next/navigation";
import { Sidebar } from "~/components/layouts/sidebar";
import { getUserFromCookie } from "~/lib/auth";
import styles from "./layout.module.css";
import { UserProvider } from "~/context/user-context";
import { AIChatProvider, AIChatSidebar } from "~/features/ai-chat";
import { DashboardMain } from "./dashboard-main";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/");
  }

  return (
    <UserProvider user={user}>
      <AIChatProvider>
        <div className={styles.dashboard}>
          <Sidebar />
          <AIChatSidebar />
          <DashboardMain>{children}</DashboardMain>
        </div>
      </AIChatProvider>
    </UserProvider>
  );
}
