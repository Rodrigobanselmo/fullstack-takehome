import { SubtaskStatus } from "generated/gql/graphql";
import { z } from "zod";

export const subtaskStatusEnum = z.nativeEnum(SubtaskStatus);

export const createSubtaskInputSchema = z.object({
  description: z.string().min(1, "Description is required"),
  deadline: z.date().optional().nullable(),
  status: subtaskStatusEnum,
  cost: z
    .number({ invalid_type_error: "Cost must be a number" })
    .max(1000000000, "Cost must be less than $1,000,000,000"),
  jobId: z.string().min(1, "Job ID is required"),
});

export const updateSubtaskArgsSchema = z.object({
  id: z.string().min(1, "Subtask ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  input: createSubtaskInputSchema.partial(),
});

export const querySubtasksArgsSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const subtaskArgsSchema = z.object({
  id: z.string().min(1, "Subtask ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
});
