"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar-layout.module.css";
import { paths } from "~/config/paths";

const navItems = [
  { label: "Chat", href: paths.dashboard.chat.getHref() },
  { label: "Recipes", href: paths.dashboard.recipes.getHref() },
  { label: "Ingredients", href: paths.dashboard.ingredients.getHref() },
];

export default function NavbarLayout() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbarNav}>
      {navItems.map(({ label, href }) => {
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
