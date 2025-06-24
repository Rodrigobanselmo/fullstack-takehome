"use client";

import type { JobStatus } from "generated/gql/graphql";
import { JOB_STATUS_OPTIONS } from "~/features/jobs/constants/job-status-map";
import styles from "./job-status-filter.module.css";

interface JobStatusFilterProps {
  selectedStatus: JobStatus | null;
  onStatusChange: (status: JobStatus | null) => void;
}

export default function JobStatusFilter({
  selectedStatus,
  onStatusChange,
}: JobStatusFilterProps) {
  const handleStatusClick = (status: JobStatus) => {
    if (selectedStatus === status) {
      onStatusChange(null);
    } else {
      onStatusChange(status);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chips}>
        {JOB_STATUS_OPTIONS.map((option) => {
          const statusValue = option.value as JobStatus;
          const isActive = selectedStatus === statusValue;

          return (
            <button
              key={option.value}
              className={`${styles.chip} ${isActive ? styles.active : ""}`}
              onClick={() => handleStatusClick(statusValue)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
