import { z } from "zod";

export const createRecipeGroupInputSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  recipeIds: z.array(z.string()).optional(),
});

export const updateRecipeGroupInputSchema = z.object({
  name: z.string().min(1, "Group name is required").optional(),
  description: z.string().optional(),
  recipeIds: z.array(z.string()).optional(),
});

export const recipeGroupArgsSchema = z.object({
  id: z.string().min(1, "Group ID is required"),
});

export const updateRecipeGroupArgsSchema = z.object({
  id: z.string().min(1, "Group ID is required"),
  input: updateRecipeGroupInputSchema,
});

export const addRecipesToGroupInputSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  recipeIds: z.array(z.string()).min(1, "At least one recipe ID is required"),
});

export const removeRecipesFromGroupInputSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  recipeIds: z.array(z.string()).min(1, "At least one recipe ID is required"),
});

export const generateRecipeGroupPresignedUrlInputSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const deleteRecipeGroupImageArgsSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
});
