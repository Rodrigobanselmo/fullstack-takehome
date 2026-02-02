"use client";

import type { JobStatus } from "generated/gql/graphql";
import Button from "~/components/ui/button/button";
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
            <Button
              key={option.value}
              variant={isActive ? "fill" : "outline"}
              color="grey"
              size="sm"
              className={styles.chip}
              onClick={() => handleStatusClick(statusValue)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
