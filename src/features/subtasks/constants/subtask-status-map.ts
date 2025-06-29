import { type SubtaskStatus } from "generated/gql/graphql";

export const SUBTASK_STATUS_MAP: Record<SubtaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

export const SUBTASK_STATUS_OPTIONS = [
  { value: "PENDING", label: SUBTASK_STATUS_MAP.PENDING },
  { value: "IN_PROGRESS", label: SUBTASK_STATUS_MAP.IN_PROGRESS },
  { value: "COMPLETED", label: SUBTASK_STATUS_MAP.COMPLETED },
  { value: "CANCELED", label: SUBTASK_STATUS_MAP.CANCELED },
] as const;
