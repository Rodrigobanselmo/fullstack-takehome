import { JobStatus } from "generated/gql/graphql";
import { z } from "zod";

export const jobStatusEnum = z.nativeEnum(JobStatus);

export const createJobInputSchema = z.object({
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  status: jobStatusEnum.optional(),
  cost: z
    .number({ invalid_type_error: "Cost must be a number" })
    .max(1000000000, "Cost must be less than $1,000,000,000"),
  homeownerId: z.string().min(1, "Homeowner ID is required"),
});

export const updateJobInputSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
  input: createJobInputSchema,
});

export const queryJobsArgsSchema = z.object({
  status: jobStatusEnum.optional().nullable(),
});

export const idSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
});
