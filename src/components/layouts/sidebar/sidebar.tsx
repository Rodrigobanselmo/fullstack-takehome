"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import {
  MessageSquare,
  BookOpen,
  Carrot,
  Sun,
  Moon,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { paths } from "~/config/paths";
import { useAIChat } from "~/features/ai-chat";
import { useTheme } from "~/context/theme-context";
import { captureException } from "~/lib/error-reporting";
import styles from "./sidebar.module.css";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  {
    label: "Chat",
    href: paths.dashboard.chat.getHref(),
    icon: MessageSquare,
  },
  {
    label: "Recipes",
    href: paths.dashboard.recipes.getHref(),
    icon: BookOpen,
  },
  {
    label: "Ingredients",
    href: paths.dashboard.ingredients.getHref(),
    icon: Carrot,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggle: toggleAIChat } = useAIChat();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [logout] = useMutation(LOGOUT_MUTATION);

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      captureException(error, { error });
      router.push("/");
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <Image
          src={resolvedTheme === "dark" ? "/icons/logo-dark.svg" : "/icons/logo.svg"}
          alt="Logo"
          width={40}
          height={40}
          className={styles.logo}
        />
      </div>

      <div className={styles.divider} />

      {/* Ask AI Button */}
      <button className={styles.askAiButton} onClick={toggleAIChat}>
        <Image
          src="/icons/ai.svg"
          alt="AI"
          width={20}
          height={20}
          className={styles.aiIcon}
        />
        <span className={styles.navLabel}>Ask AI</span>
      </button>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <Icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={styles.bottomSection}>
        <button
          className={styles.bottomButton}
          onClick={toggleTheme}
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={20} className={styles.navIcon} />
          ) : (
            <Moon size={20} className={styles.navIcon} />
          )}
          <span className={styles.navLabel}>Theme</span>
        </button>
        <button className={styles.bottomButton} onClick={handleLogout}>
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

