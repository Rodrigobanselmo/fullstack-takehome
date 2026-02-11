import { z } from "zod";
import { RecipeTag } from "generated/gql/graphql";

export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Quantity must be a positive number",
    }),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
  optional: z.boolean().optional(),
  price: z.string().optional(),
});

export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(1, "Recipe name is required")
    .min(2, "Recipe name must be at least 2 characters")
    .max(200, "Recipe name must be less than 200 characters"),
  servings: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Servings must be a positive number",
    }),
  tags: z.array(z.enum(RecipeTag)).optional(),
  overallRating: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseInt(val);
        return !isNaN(num) && num >= 1 && num <= 5;
      },
      {
        message: "Rating must be between 1 and 5",
      },
    ),
  prepTimeMinutes: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseInt(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Prep time must be a positive number",
      },
    ),
  instructions: z.string().optional(),
  imageFileId: z.string().nullable().optional(),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "At least one ingredient is required"),
});

export type CreateRecipeFormData = z.infer<typeof createRecipeSchema>;
export type RecipeIngredientFormData = z.infer<typeof recipeIngredientSchema>;
