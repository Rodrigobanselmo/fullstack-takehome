import type {
  CreateRecipeInput,
  Recipe,
  UpdateRecipeInput,
} from "generated/gql/graphql";
import { recipeRepository } from "~/server/repositories/recipe.repository";
import { RecipeNotFoundError } from "./recipe.errors";

export async function getRecipesByUserId({
  userId,
}: {
  userId: string;
}): Promise<Recipe[]> {
  return recipeRepository.findManyByUserId(userId);
}

export async function getRecipeById({
  recipeId,
  userId,
}: {
  recipeId: string;
  userId: string;
}): Promise<Recipe> {
  const recipe = await recipeRepository.findById(recipeId, userId);

  if (!recipe) {
    throw RecipeNotFoundError();
  }

  return recipe;
}

export async function createRecipe({
  userId,
  input,
}: {
  userId: string;
  input: CreateRecipeInput;
}): Promise<Recipe> {
  return recipeRepository.create({
    name: input.name,
    servings: input.servings,
    userId,
    ingredients: input.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
  });
}

export async function updateRecipe({
  userId,
  recipeId,
  input,
}: {
  userId: string;
  recipeId: string;
  input: UpdateRecipeInput;
}): Promise<Recipe> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  return recipeRepository.update(recipeId, userId, {
    name: input.name ?? undefined,
    servings: input.servings ?? undefined,
    ingredients: input.ingredients?.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
  });
}

export async function deleteRecipe({
  userId,
  recipeId,
}: {
  userId: string;
  recipeId: string;
}): Promise<boolean> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  await recipeRepository.softDelete(recipeId, userId);
  return true;
}

