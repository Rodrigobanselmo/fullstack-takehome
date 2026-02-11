import { z } from "zod";
import { IngredientCategory } from "generated/gql/graphql";

export const createIngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .min(2, "Ingredient name must be at least 2 characters")
    .max(200, "Ingredient name must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  categories: z.array(z.enum(IngredientCategory)).optional(),
  defaultUnit: z.string().optional(),
  averagePrice: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Price must be a positive number",
      },
    ),
  priceUnit: z.string().optional(),
  priceCurrency: z.string().optional(),
});

export type CreateIngredientFormData = z.infer<typeof createIngredientSchema>;
