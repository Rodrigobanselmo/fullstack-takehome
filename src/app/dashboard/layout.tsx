import { redirect } from "next/navigation";
import NavbarLayout from "~/components/layouts/navbar-layout/navbar-layout";
import LogoutButton from "~/components/ui/logout-button/logout-button";
import { getUserFromCookie } from "~/lib/auth";
import styles from "./layout.module.css";

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
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={`${styles.subtitle} ${styles.subtitleMobileHidden}`}>
              Welcome, {user.username} ({user.role.toLowerCase()})
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <NavbarLayout />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
