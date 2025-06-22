import type { JobStatus } from "generated/gql/graphql";

export const JOB_STATUS_MAP: Record<JobStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
} as const;

export const JOB_STATUS_OPTIONS = [
  { value: "PLANNING", label: JOB_STATUS_MAP.PLANNING },
  { value: "IN_PROGRESS", label: JOB_STATUS_MAP.IN_PROGRESS },
  { value: "COMPLETED", label: JOB_STATUS_MAP.COMPLETED },
  { value: "CANCELED", label: JOB_STATUS_MAP.CANCELED },
];
