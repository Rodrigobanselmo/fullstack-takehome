import { z } from "zod";
import { JobStatus } from "generated/gql/graphql";

export const createJobSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must be less than 500 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be less than 200 characters"),
  status: z.nativeEnum(JobStatus, {
    errorMap: () => ({ message: "Please select a valid job status" }),
  }),
  cost: z
    .string()
    .min(1, "Cost is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Cost must be a positive number",
    }),
  homeownerId: z.string().optional(),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;
