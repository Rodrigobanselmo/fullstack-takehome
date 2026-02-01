import DataLoader from "dataloader";
import { prisma } from "~/server/database/prisma";
import type { Recipe, RecipeIngredient } from "generated/gql/graphql";

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
    const recipeIds = [...new Set(recipeGroupRecipes.map((rgr) => rgr.recipeId))];

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
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt,
          ingredients: [], // Will be loaded by field resolver
        } as Recipe,
      ])
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
  return new DataLoader<string, RecipeIngredient[]>(async (recipeIds) => {
    // Fetch all ingredients for the requested recipe IDs
    const ingredients = await prisma.recipe_ingredients.findMany({
      where: {
        recipeId: { in: [...recipeIds] },
      },
    });

    // Group ingredients by recipeId
    const ingredientsByRecipeId = new Map<string, RecipeIngredient[]>();

    for (const ingredient of ingredients) {
      if (!ingredientsByRecipeId.has(ingredient.recipeId)) {
        ingredientsByRecipeId.set(ingredient.recipeId, []);
      }

      ingredientsByRecipeId.get(ingredient.recipeId)!.push({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity.toNumber(),
        unit: ingredient.unit,
      });
    }

    // Return ingredients in the same order as recipeIds
    // If a recipe has no ingredients, return empty array
    return recipeIds.map((recipeId) => ingredientsByRecipeId.get(recipeId) ?? []);
  });
}

