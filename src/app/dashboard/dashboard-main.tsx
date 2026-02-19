"use client";

import { useAIChat } from "~/features/ai-chat";
import styles from "./layout.module.css";

const SIDEBAR_WIDTH = 72;

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const { isOpen, panelWidth } = useAIChat();

  // Calculate margin: sidebar (72px) + AI panel width when open
  const marginLeft = isOpen ? SIDEBAR_WIDTH + panelWidth : SIDEBAR_WIDTH;

  return (
    <main className={styles.main} style={{ marginLeft }}>
      {children}
    </main>
  );
}

