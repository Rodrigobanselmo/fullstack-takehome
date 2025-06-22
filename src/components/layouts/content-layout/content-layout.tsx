"use client";

import PageHeader from "~/components/ui/page-header/page-header";
import styles from "./content-layout.module.css";

interface ContentLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export default function ContentLayout({
  children,
  title,
  actions,
  onBack,
}: ContentLayoutProps) {
  return (
    <div className={styles.main}>
      <PageHeader title={title} onBack={onBack}>
        {actions}
      </PageHeader>
      {children}
    </div>
  );
}
