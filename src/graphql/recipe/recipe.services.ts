import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from "generated/gql/graphql";
import { validateFileUploaded } from "~/graphql/file/file.services";
import { withTransaction } from "~/server/database/transaction";
import {
  recipeRepository,
  type RecipeEntity,
} from "~/server/repositories/recipe.repository";
import { RecipeNotFoundError } from "./recipe.errors";

export async function getRecipesByUserId({
  userId,
}: {
  userId: string;
}): Promise<RecipeEntity[]> {
  return recipeRepository.findManyByUserId({ userId });
}

export async function getRecipeById({
  recipeId,
  userId,
}: {
  recipeId: string;
  userId: string;
}): Promise<RecipeEntity> {
  const recipe = await recipeRepository.findById({ recipeId, userId });

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
}): Promise<RecipeEntity> {
  // Validate image file has been uploaded if provided
  if (input.imageFileId) {
    await validateFileUploaded({
      fileId: input.imageFileId,
      userId,
    });
  }

  return withTransaction(async () => {
    const recipe = await recipeRepository.create({
      name: input.name,
      servings: input.servings,
      userId,
      tags: input.tags ?? undefined,
      overallRating: input.overallRating ?? undefined,
      prepTimeMinutes: input.prepTimeMinutes ?? undefined,
      instructions: input.instructions ?? undefined,
      ingredients: input.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        notes: ingredient.notes ?? undefined,
        optional: ingredient.optional ?? undefined,
        price: ingredient.price ?? undefined,
      })),
    });

    // Attach image if provided
    if (input.imageFileId) {
      await recipeRepository.attachFileToRecipe({
        recipeId: recipe.id,
        fileId: input.imageFileId,
      });
    }

    return recipe;
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
}): Promise<RecipeEntity> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  // Validate image file has been uploaded if provided
  if (input.imageFileId) {
    await validateFileUploaded({
      fileId: input.imageFileId,
      userId,
    });
  }

  return withTransaction(async () => {
    const recipe = await recipeRepository.update({
      recipeId,
      userId,
      name: input.name ?? undefined,
      servings: input.servings ?? undefined,
      tags: input.tags ?? undefined,
      // Nullable fields: use "field in input" to distinguish null from undefined
      overallRating: "overallRating" in input ? input.overallRating : undefined,
      prepTimeMinutes: "prepTimeMinutes" in input ? input.prepTimeMinutes : undefined,
      instructions: "instructions" in input ? input.instructions : undefined,
      ingredients: input.ingredients?.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        notes: ingredient.notes ?? undefined,
        optional: ingredient.optional ?? undefined,
        price: ingredient.price ?? undefined,
      })),
    });

    // Handle image update/removal
    // Check if imageFileId is explicitly set in the input (even if null)
    if ("imageFileId" in input) {
      // Get existing file IDs for recipe
      const existingFileIds = await recipeRepository.findFileIdsByRecipeId({
        recipeId,
      });

      // Remove old files first (batch operation)
      if (existingFileIds.length > 0) {
        await recipeRepository.detachFilesFromRecipe({
          recipeId,
          fileIds: existingFileIds,
        });
      }

      // Attach new image if provided (not null)
      if (input.imageFileId) {
        await recipeRepository.attachFileToRecipe({
          recipeId,
          fileId: input.imageFileId,
        });
      }
    }

    return recipe;
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

  await recipeRepository.softDelete({ recipeId, userId });
  return true;
}


