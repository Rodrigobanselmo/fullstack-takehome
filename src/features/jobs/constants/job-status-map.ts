import type { JobStatus } from "generated/gql/graphql";

export const JOB_STATUS_MAP: Record<JobStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
} as const;

export const JOB_STATUS_OPTIONS = [
  { value: "planning", label: JOB_STATUS_MAP.planning },
  { value: "in_progress", label: JOB_STATUS_MAP.in_progress },
  { value: "completed", label: JOB_STATUS_MAP.completed },
  { value: "canceled", label: JOB_STATUS_MAP.canceled },
];
