"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar-layout.module.css";
import { paths } from "~/config/paths";
import type { UserSession } from "~/lib/auth";
import { getAuthenticatedRoute } from "~/lib/navigation";
import { UserRole } from "generated/gql/graphql";

const navItems = (user: UserSession) => [
  {
    label: user.role === UserRole.Contractor ? "My Jobs" : "My Projects",
    href: getAuthenticatedRoute(user.role),
  },
  { label: "Chat", href: paths.dashboard.chat.getHref() },
];

export default function NavbarLayout({ user }: { user: UserSession }) {
  const pathname = usePathname();

  return (
    <nav className={styles.navbarNav}>
      {navItems(user).map(({ label, href }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? `${styles.navbarLink} ${styles.navbarLinkActive}`
                : styles.navbarLink
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
