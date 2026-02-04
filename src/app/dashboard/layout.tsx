import { redirect } from "next/navigation";
import NavbarLayout from "~/components/layouts/navbar-layout/navbar-layout";
import LogoutButton from "~/components/ui/logout-button/logout-button";
import { getUserFromCookie } from "~/lib/auth";
import styles from "./layout.module.css";
import { UserProvider } from "~/context/user-context";
import {
  AIChatProvider,
  AIChatSidebar,
  AIChatToggleButton,
} from "~/features/ai-chat";

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
          <header className={styles.header}>
            <div className={styles.headerContainer}>
              <div className={styles.headerContent}>
                {/* <span className={styles.logo} aria-label="Home" title="Dashboard">
                  <Image
                    src="/favicon.ico"
                    alt="Dashboard Icon"
                    width={28}
                    height={28}
                    style={{ display: "block" }}
                    priority
                  />
                </span> */}
                <div>
                  <h1
                    className={`${styles.title} ${styles.subtitleMobileHidden}`}
                  >
                    Dashboard
                  </h1>
                  <p
                    className={`${styles.subtitle} ${styles.subtitleMobileHidden}`}
                  >
                    Welcome, {user.username} ({user.role.toLowerCase()})
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <NavbarLayout />
                <LogoutButton />
              </div>
            </div>
          </header>
          <main className={styles.main}>{children}</main>
        </div>

        {/* AI Chat */}
        <AIChatToggleButton />
        <AIChatSidebar />
      </AIChatProvider>
    </UserProvider>
  );
}
