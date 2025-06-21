"use client";

import { useRouter } from "next/navigation";
import PageHeader from "~/components/ui/page-header/page-header";
import styles from "./page.module.css";
import { ROUTES } from "~/constants/routes";

export default function AddJobPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD.CONTRACTOR.ROOT);
  };

  return (
    <div className={styles.main}>
      <PageHeader title="Add New Job" onBack={handleBack} />

      <div className={styles.content}>
        <p>Add job form will go here</p>
      </div>
    </div>
  );
}
