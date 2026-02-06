import { z } from "zod";
import { RecipeTag } from "generated/gql/graphql";
import { isNil } from "~/lib/utils";

export const recipeIngredientInputSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient ID is required"),
  quantity: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input)
          ? "Quantity is required"
          : "Quantity must be a number",
    })
    .positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
  optional: z.boolean().optional(),
  price: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Price must be a number",
    })
    .nonnegative("Price must be non-negative")
    .optional(),
});

export const createRecipeInputSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  servings: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? "Servings is required" : "Servings must be a number",
    })
    .int("Servings must be an integer")
    .positive("Servings must be positive"),
  tags: z.array(z.enum(RecipeTag)).optional(),
  overallRating: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Overall rating must be a number",
    })
    .int("Overall rating must be an integer")
    .min(1, "Overall rating must be at least 1")
    .max(5, "Overall rating must be at most 5")
    .optional(),
  prepTimeMinutes: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Prep time must be a number",
    })
    .int("Prep time must be an integer")
    .positive("Prep time must be positive")
    .optional(),
  instructions: z.string().optional(),
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, "At least one ingredient is required"),
});

export const updateRecipeInputSchema = z.object({
  name: z.string().min(1, "Recipe name is required").optional(),
  servings: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Servings must be a number",
    })
    .int("Servings must be an integer")
    .positive("Servings must be positive")
    .optional(),
  tags: z.array(z.enum(RecipeTag)).optional(),
  overallRating: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Overall rating must be a number",
    })
    .int("Overall rating must be an integer")
    .min(1, "Overall rating must be at least 1")
    .max(5, "Overall rating must be at most 5")
    .optional(),
  prepTimeMinutes: z
    .number({
      error: (issue: { input: unknown }) =>
        isNil(issue.input) ? undefined : "Prep time must be a number",
    })
    .int("Prep time must be an integer")
    .positive("Prep time must be positive")
    .optional(),
  instructions: z.string().optional(),
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
