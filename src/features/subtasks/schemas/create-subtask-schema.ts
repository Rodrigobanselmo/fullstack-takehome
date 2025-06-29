import { SubtaskStatus } from "generated/gql/graphql";
import { z } from "zod";

export const createSubtaskSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .transform((val) => val.trim()),
  cost: z
    .number()
    .min(0, "Cost must be greater than or equal to 0")
    .max(1000000000, "Cost must be less than $1,000,000,000"),
  deadline: z.date().optional(),
  status: z
    .nativeEnum(SubtaskStatus, {
      errorMap: () => ({ message: "Please select a valid status" }),
    })
    .transform((val) => val as SubtaskStatus),
});

export type CreateSubtaskFormData = z.infer<typeof createSubtaskSchema>;
