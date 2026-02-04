import DataLoader from "dataloader";
import { prisma } from "~/server/database/prisma";
import type { Ingredient } from "generated/gql/graphql";

/**
 * DataLoader for batch loading ingredients by ID
 * Prevents N+1 query problem when loading ingredients for multiple recipe ingredients
 *
 * NOTE: This loader does NOT filter by deletedAt because it's used to load
 * ingredients for existing recipes. Soft-deleted ingredients should still be
 * visible in recipes that already use them. The ingredients list query
 * handles the filtering separately.
 */
export function createIngredientByIdLoader() {
  return new DataLoader<string, Ingredient | null>(async (ingredientIds) => {
    // Fetch all ingredients for the requested IDs (including soft-deleted ones)
    // This allows recipes to still show ingredients that have been deleted
    const ingredients = await prisma.ingredients.findMany({
      where: {
        id: { in: [...ingredientIds] },
      },
    });

    // Create a map of ingredientId -> ingredient
    const ingredientMap = new Map(
      ingredients.map((ingredient) => [
        ingredient.id,
        {
          id: ingredient.id,
          name: ingredient.name,
          description: ingredient.description ?? undefined,
          defaultUnit: ingredient.defaultUnit ?? undefined,
          averagePrice: ingredient.averagePrice?.toNumber() ?? undefined,
          priceUnit: ingredient.priceUnit ?? undefined,
          priceCurrency: ingredient.priceCurrency ?? undefined,
          userId: ingredient.userId,
          createdAt: ingredient.createdAt,
          updatedAt: ingredient.updatedAt,
        } as Ingredient,
      ]),
    );

    // Return ingredients in the same order as ingredientIds
    // If an ingredient is not found, return null
    return ingredientIds.map((id) => ingredientMap.get(id) ?? null);
  });
}
