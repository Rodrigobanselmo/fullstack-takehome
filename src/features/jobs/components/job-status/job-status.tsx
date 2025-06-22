import React from "react";
import styles from "./job-status.module.css";
import { JobStatus as JobStatusEnum } from "generated/gql/graphql";
import { JOB_STATUS_MAP } from "../../constants/job-status-map";

interface JobStatusProps {
  status: JobStatusEnum;
}

const JobStatus: React.FC<JobStatusProps> = ({ status }) => {
  const statusConfig = {
    [JobStatusEnum.Planning]: {
      className: styles.jobStatus + " " + styles.planning,
      displayText: JOB_STATUS_MAP.PLANNING,
    },
    [JobStatusEnum.InProgress]: {
      className: styles.jobStatus + " " + styles.inProgress,
      displayText: JOB_STATUS_MAP.IN_PROGRESS,
    },
    [JobStatusEnum.Completed]: {
      className: styles.jobStatus + " " + styles.completed,
      displayText: JOB_STATUS_MAP.COMPLETED,
    },
    [JobStatusEnum.Canceled]: {
      className: styles.jobStatus + " " + styles.canceled,
      displayText: JOB_STATUS_MAP.CANCELED,
    },
  };

  const config = statusConfig[status] ?? {
    className: styles.jobStatus + " " + styles.planning,
    displayText: status,
  };

  return <span className={config.className}>{config.displayText}</span>;
};

export default JobStatus;
