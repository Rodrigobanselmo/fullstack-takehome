import { z } from "zod";

export const recipeIngredientInputSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
});

export const createRecipeInputSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  servings: z
    .number({ invalid_type_error: "Servings must be a number" })
    .int("Servings must be an integer")
    .positive("Servings must be positive"),
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, "At least one ingredient is required"),
});

export const updateRecipeInputSchema = z.object({
  name: z.string().min(1, "Recipe name is required").optional(),
  servings: z
    .number({ invalid_type_error: "Servings must be a number" })
    .int("Servings must be an integer")
    .positive("Servings must be positive")
    .optional(),
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, "At least one ingredient is required")
    .optional(),
});

export const updateRecipeArgsSchema = z.object({
  id: z.string().min(1, "Recipe ID is required"),
  input: updateRecipeInputSchema,
});

export const generatePresignedUrlInputSchema = z.object({
  recipeId: z.string().min(1, "Recipe ID is required"),
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const deleteRecipeImageArgsSchema = z.object({
  recipeId: z.string().min(1, "Recipe ID is required"),
});

export const recipeArgsSchema = z.object({
  id: z.string().min(1, "Recipe ID is required"),
});

