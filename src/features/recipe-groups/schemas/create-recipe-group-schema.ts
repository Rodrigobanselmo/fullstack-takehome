import { z } from "zod";

export const createRecipeGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .min(2, "Group name must be at least 2 characters")
    .max(200, "Group name must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  recipeIds: z.array(z.string()).optional(),
});

export type CreateRecipeGroupFormData = z.infer<typeof createRecipeGroupSchema>;
