import React from "react";
import styles from "./job-card.module.css";
import JobStatus from "../job-status/job-status";
import type { JobStatus as JobStatusEnum } from "generated/gql/graphql";

interface JobCardProps {
  description: string;
  location: string;
  status: JobStatusEnum;
  cost: number;
  name?: string;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  description,
  location,
  status,
  cost,
  name,
  onClick,
}) => {
  return (
    <div className={styles.jobCard} onClick={onClick}>
      <div className={styles.jobHeader}>
        <h3 className={styles.jobTitle}>{description}</h3>
        <JobStatus status={status} />
      </div>

      <div className={styles.jobDetails}>
        <div className={styles.jobMeta}>
          <span className={styles.jobMetaIcon}>📍</span>
          <span className={styles.jobLocation}>{location}</span>
        </div>

        <div className={styles.jobMeta}>
          <span className={styles.jobMetaIcon}>👤</span>
          <span>{name}</span>
        </div>

        <div className={styles.jobCost}>
          <span className={styles.currencySymbol}>$</span>
          {cost.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
