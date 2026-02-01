import { type SubtaskStatus } from "generated/gql/graphql";

export const SUBTASK_STATUS_MAP: Record<SubtaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};

export const SUBTASK_STATUS_OPTIONS = [
  { value: "pending", label: SUBTASK_STATUS_MAP.pending },
  { value: "in_progress", label: SUBTASK_STATUS_MAP.in_progress },
  { value: "completed", label: SUBTASK_STATUS_MAP.completed },
  { value: "canceled", label: SUBTASK_STATUS_MAP.canceled },
] as const;
