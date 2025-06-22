"use client";

import PageHeader from "~/components/ui/page-header/page-header";
import styles from "./content-layout.module.css";

interface ContentLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export default function ContentLayout({
  children,
  title,
  actions,
}: ContentLayoutProps) {
  return (
    <div className={styles.main}>
      <PageHeader title={title}>{actions}</PageHeader>
      {children}
    </div>
  );
}
