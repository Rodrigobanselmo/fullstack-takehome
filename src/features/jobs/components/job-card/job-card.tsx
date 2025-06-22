import React from "react";
import styles from "./job-card.module.css";
import JobStatus from "../job-status/job-status";
import type { JobStatus as JobStatusEnum } from "generated/gql/graphql";

interface JobCardProps {
  id: string;
  description: string;
  location: string;
  status: JobStatusEnum;
  cost: number;
  username?: string;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  description,
  location,
  status,
  cost,
  username,
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
          <span>{location}</span>
        </div>

        {username && (
          <div className={styles.jobMeta}>
            <span className={styles.jobMetaIcon}>👤</span>
            <span>{username}</span>
          </div>
        )}

        <div className={styles.jobCost}>${cost.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default JobCard;
