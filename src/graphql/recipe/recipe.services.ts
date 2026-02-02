import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from "generated/gql/graphql";
import {
  recipeRepository,
  type RecipeEntity,
} from "~/server/repositories/recipe.repository";
import { RecipeNotFoundError } from "./recipe.errors";
import { uploadFile, deleteFile } from "~/graphql/file/file.services";
import {
  fileRepository,
  type FileEntity,
} from "~/server/repositories/file.repository";
import { withTransaction } from "~/server/database/transaction";
import { env } from "~/config/env";
import { generatePresignedPost } from "~/lib/s3";

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
  return recipeRepository.create({
    name: input.name,
    servings: input.servings,
    userId,
    tags: input.tags ?? undefined,
    overallRating: input.overallRating ?? undefined,
    prepTimeMinutes: input.prepTimeMinutes ?? undefined,
    ingredients: input.ingredients.map((ingredient) => ({
      ingredientId: ingredient.ingredientId,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes ?? undefined,
      optional: ingredient.optional ?? undefined,
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
}): Promise<RecipeEntity> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  return recipeRepository.update({
    recipeId,
    userId,
    name: input.name ?? undefined,
    servings: input.servings ?? undefined,
    tags: input.tags ?? undefined,
    overallRating: input.overallRating ?? undefined,
    prepTimeMinutes: input.prepTimeMinutes ?? undefined,
    ingredients: input.ingredients?.map((ingredient) => ({
      ingredientId: ingredient.ingredientId,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes ?? undefined,
      optional: ingredient.optional ?? undefined,
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

  await recipeRepository.softDelete({ recipeId, userId });
  return true;
}

/**
 * Upload image for recipe (replaces existing if any)
 */
export async function uploadRecipeImage({
  recipeId,
  userId,
  file,
  filename,
  mimeType,
}: {
  recipeId: string;
  userId: string;
  file: Buffer;
  filename: string;
  mimeType: string;
}): Promise<FileEntity> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  // Get existing file IDs for recipe
  const existingFileIds = await recipeRepository.findFileIdsByRecipeId({
    recipeId,
  });

  // Use transaction to ensure atomicity
  return withTransaction(async () => {
    // Upload new file
    const newFile = await uploadFile({
      file,
      filename,
      mimeType,
      uploaderId: userId,
    });

    // Attach to recipe
    await recipeRepository.attachFileToRecipe({ recipeId, fileId: newFile.id });

    // Delete old files (if any)
    for (const oldFileId of existingFileIds) {
      await recipeRepository.detachFileFromRecipe({
        recipeId,
        fileId: oldFileId,
      });
    }

    return newFile;
  });
}

/**
 * Delete recipe image
 */
export async function deleteRecipeImage({
  recipeId,
  userId,
}: {
  recipeId: string;
  userId: string;
}): Promise<void> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  const fileIds = await recipeRepository.findFileIdsByRecipeId({ recipeId });

  for (const fileId of fileIds) {
    await recipeRepository.detachFileFromRecipe({ recipeId, fileId });
    await deleteFile(fileId);
  }
}

/**
 * Upload recipe image - creates file record and returns presigned URL
 * Client will upload directly to S3 using the presigned URL
 */
export async function uploadRecipeImagePresigned({
  recipeId,
  userId,
  filename,
  mimeType,
}: {
  recipeId: string;
  userId: string;
  filename: string;
  mimeType: string;
}): Promise<{
  file: FileEntity;
  presignedPost: {
    url: string;
    fields: Record<string, string>;
    key: string;
  };
}> {
  // Verify recipe exists and belongs to user
  await getRecipeById({ recipeId, userId });

  // Generate presigned URL
  const presignedPost = await generatePresignedPost({
    folder: "recipe-images",
    filename,
    mimeType,
    maxSizeMB: 5,
  });

  // Get existing file IDs for recipe
  const existingFileIds = await recipeRepository.findFileIdsByRecipeId({
    recipeId,
  });

  // Use transaction to ensure atomicity
  const newFile = await withTransaction(async () => {
    // Create database record for the file (even before upload)
    const file = await fileRepository.create({
      key: presignedPost.key,
      bucket: env.AWS_S3_BUCKET,
      region: env.AWS_REGION,
      filename,
      mimeType,
      size: 0, // We don't know the size yet
      uploaderId: userId,
    });

    // Attach to recipe
    await recipeRepository.attachFileToRecipe({ recipeId, fileId: file.id });

    // Soft delete old files (if any)
    for (const oldFileId of existingFileIds) {
      await recipeRepository.detachFileFromRecipe({
        recipeId,
        fileId: oldFileId,
      });
      await deleteFile(oldFileId);
    }

    return file;
  });

  return {
    file: newFile,
    presignedPost,
  };
}
