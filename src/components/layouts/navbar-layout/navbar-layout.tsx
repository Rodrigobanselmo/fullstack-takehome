"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar-layout.module.css";

const navItems = [
  { label: "My Jobs", href: "/dashboard/contractor" },
  { label: "Chat", href: "/dashboard/chat" },
];

export default function NavbarLayout() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbarNav}>
      {navItems.map(({ label, href }) => {
        const isActive = pathname === href;
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
