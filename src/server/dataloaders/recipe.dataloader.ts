import DataLoader from "dataloader";
import { prisma } from "~/server/database/prisma";
import type { Recipe } from "generated/gql/graphql";
import type { RecipeIngredientEntity } from "~/server/repositories/recipe.repository";

/**
 * DataLoader for batch loading recipes by group ID
 * Prevents N+1 query problem when loading recipes for multiple groups
 */
export function createRecipesByGroupIdLoader() {
  return new DataLoader<string, Recipe[]>(async (groupIds) => {
    // Fetch all recipe-group relationships for the requested group IDs
    const recipeGroupRecipes = await prisma.recipe_group_recipes.findMany({
      where: {
        groupId: { in: [...groupIds] },
      },
    });

    // Get unique recipe IDs
    const recipeIds = [
      ...new Set(recipeGroupRecipes.map((rgr) => rgr.recipeId)),
    ];

    // Fetch all recipes in one query
    const recipes = await prisma.recipes.findMany({
      where: {
        id: { in: recipeIds },
        deletedAt: null,
      },
    });

    // Create a map of recipeId -> recipe for quick lookup
    const recipeMap = new Map(
      recipes.map((recipe) => [
        recipe.id,
        {
          id: recipe.id,
          name: recipe.name,
          servings: recipe.servings,
          tags: recipe.tags,
          overallRating: recipe.overallRating ?? undefined,
          prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
          ingredients: [], // Will be loaded by field resolver
        } as Recipe,
      ]),
    );

    // Group recipes by groupId
    const recipesByGroupId = new Map<string, Recipe[]>();

    for (const rgr of recipeGroupRecipes) {
      const groupId = rgr.groupId;
      const recipe = recipeMap.get(rgr.recipeId);

      if (recipe) {
        if (!recipesByGroupId.has(groupId)) {
          recipesByGroupId.set(groupId, []);
        }
        recipesByGroupId.get(groupId)!.push(recipe);
      }
    }

    // Return recipes in the same order as groupIds
    // If a group has no recipes, return empty array
    return groupIds.map((groupId) => recipesByGroupId.get(groupId) ?? []);
  });
}

/**
 * DataLoader for batch loading ingredients by recipe ID
 * Prevents N+1 query problem when loading ingredients for multiple recipes
 */
export function createIngredientsByRecipeIdLoader() {
  return new DataLoader<string, RecipeIngredientEntity[]>(async (recipeIds) => {
    // Fetch all recipe_ingredients for the requested recipe IDs
    const recipeIngredients = await prisma.recipe_ingredients.findMany({
      where: {
        recipeId: { in: [...recipeIds] },
      },
    });

    // Group recipe_ingredients by recipeId
    const ingredientsByRecipeId = new Map<string, RecipeIngredientEntity[]>();

    for (const ri of recipeIngredients) {
      if (!ingredientsByRecipeId.has(ri.recipeId)) {
        ingredientsByRecipeId.set(ri.recipeId, []);
      }

      // Return only the recipe_ingredient data
      // The ingredient object will be loaded by a field resolver
      ingredientsByRecipeId.get(ri.recipeId)!.push({
        id: ri.id,
        ingredientId: ri.ingredientId,
        quantity: ri.quantity.toNumber(),
        unit: ri.unit,
        notes: ri.notes ?? undefined,
        optional: ri.optional,
        price: ri.price?.toNumber() ?? undefined,
      });
    }

    // Return ingredients in the same order as recipeIds
    // If a recipe has no ingredients, return empty array
    return recipeIds.map(
      (recipeId) => ingredientsByRecipeId.get(recipeId) ?? [],
    );
  });
}
