import React from "react";
import styles from "./job-status.module.css";
import { JobStatus as JobStatusEnum } from "generated/gql/graphql";

interface JobStatusProps {
  status: JobStatusEnum;
}

const JobStatus: React.FC<JobStatusProps> = ({ status }) => {
  const statusConfig = {
    [JobStatusEnum.Planning]: {
      className: styles.jobStatus + " " + styles.planning,
      displayText: "Planning",
    },
    [JobStatusEnum.InProgress]: {
      className: styles.jobStatus + " " + styles.inProgress,
      displayText: "In Progress",
    },
    [JobStatusEnum.Completed]: {
      className: styles.jobStatus + " " + styles.completed,
      displayText: "Completed",
    },
    [JobStatusEnum.Canceled]: {
      className: styles.jobStatus + " " + styles.canceled,
      displayText: "Canceled",
    },
  };

  const config = statusConfig[status] ?? {
    className: styles.jobStatus + " " + styles.planning,
    displayText: status,
  };

  return <span className={config.className}>{config.displayText}</span>;
};

export default JobStatus;
