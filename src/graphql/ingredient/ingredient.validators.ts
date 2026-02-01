import { z } from "zod";

export const createIngredientInputSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultUnit: z.string().optional(),
  averagePrice: z
    .number({ invalid_type_error: "Average price must be a number" })
    .nonnegative("Average price must be non-negative")
    .optional(),
  priceUnit: z.string().optional(),
  priceCurrency: z.string().optional(),
});

export const updateIngredientInputSchema = z.object({
  name: z.string().min(1, "Ingredient name is required").optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultUnit: z.string().optional(),
  averagePrice: z
    .number({ invalid_type_error: "Average price must be a number" })
    .nonnegative("Average price must be non-negative")
    .optional(),
  priceUnit: z.string().optional(),
  priceCurrency: z.string().optional(),
});

export const updateIngredientArgsSchema = z.object({
  id: z.string().min(1, "Ingredient ID is required"),
  input: updateIngredientInputSchema,
});

export const generateIngredientPresignedUrlInputSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient ID is required"),
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const deleteIngredientImageArgsSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient ID is required"),
});

export const ingredientArgsSchema = z.object({
  id: z.string().min(1, "Ingredient ID is required"),
});

