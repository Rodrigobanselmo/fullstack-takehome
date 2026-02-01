import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "generated/gql/graphql";
import {
  ingredientRepository,
  type IngredientEntity,
} from "~/server/repositories/ingredient.repository";
import { IngredientNotFoundError } from "./ingredient.errors";
import { fileRepository, type FileEntity } from "~/server/repositories/file.repository";
import { withTransaction } from "~/server/database/transaction";
import { env } from "~/config/env";
import { generatePresignedPost } from "~/lib/s3";
import { type Prisma } from "generated/prisma";

export async function getIngredientsByUserId({
  userId,
}: {
  userId: string;
}): Promise<IngredientEntity[]> {
  return ingredientRepository.findManyByUserId({ userId });
}

export async function getIngredientById({
  ingredientId,
  userId,
}: {
  ingredientId: string;
  userId: string;
}): Promise<IngredientEntity> {
  const ingredient = await ingredientRepository.findById({ ingredientId, userId });

  if (!ingredient) {
    throw IngredientNotFoundError();
  }

  return ingredient;
}

export async function createIngredient({
  userId,
  input,
}: {
  userId: string;
  input: CreateIngredientInput;
}): Promise<IngredientEntity> {
  return ingredientRepository.create({
    name: input.name,
    description: input.description ?? undefined,
    category: (input.category as string) ?? undefined,
    defaultUnit: input.defaultUnit ?? undefined,
    averagePrice: input.averagePrice as Prisma.Decimal | undefined,
    priceUnit: input.priceUnit ?? undefined,
    priceCurrency: input.priceCurrency ?? undefined,
    userId,
  });
}

export async function updateIngredient({
  userId,
  ingredientId,
  input,
}: {
  userId: string;
  ingredientId: string;
  input: UpdateIngredientInput;
}): Promise<IngredientEntity> {
  // Verify ingredient exists and belongs to user
  await getIngredientById({ ingredientId, userId });

  const updated = await ingredientRepository.update({
    ingredientId,
    userId,
    name: input.name ?? undefined,
    description: input.description ?? undefined,
    category: (input.category as string) ?? undefined,
    defaultUnit: input.defaultUnit ?? undefined,
    averagePrice: input.averagePrice as Prisma.Decimal | undefined,
    priceUnit: input.priceUnit ?? undefined,
    priceCurrency: input.priceCurrency ?? undefined,
  });

  if (!updated) {
    throw IngredientNotFoundError();
  }

  return updated;
}

export async function deleteIngredient({
  userId,
  ingredientId,
}: {
  userId: string;
  ingredientId: string;
}): Promise<boolean> {
  // Verify ingredient exists and belongs to user
  await getIngredientById({ ingredientId, userId });

  await ingredientRepository.delete({ ingredientId, userId });
  return true;
}

/**
 * Upload image for ingredient (replaces existing if any)
 */
export async function uploadIngredientImagePresigned({
  userId,
  ingredientId,
  filename,
  mimeType,
}: {
  userId: string;
  ingredientId: string;
  filename: string;
  mimeType: string;
}): Promise<{ file: FileEntity; presignedPost: { url: string; fields: Record<string, string>; key: string } }> {
  // Verify ingredient exists and belongs to user
  await getIngredientById({ ingredientId, userId });

  // Generate presigned POST URL
  const presignedPost = await generatePresignedPost({
    folder: "ingredient-images",
    filename,
    mimeType,
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

    // Delete old ingredient image if exists
    const db = (await import("~/server/database/transaction")).getPrismaClient();
    const existingFile = await db.ingredient_files.findFirst({
      where: { ingredientId },
    });

    if (existingFile) {
      await db.ingredient_files.delete({
        where: { id: existingFile.id },
      });
    }

    // Create new ingredient_files record
    await db.ingredient_files.create({
      data: {
        ingredientId,
        fileId: file.id,
      },
    });

    return file;
  });

  return {
    file: newFile,
    presignedPost: {
      url: presignedPost.url,
      fields: presignedPost.fields,
      key: presignedPost.key,
    },
  };
}

/**
 * Delete ingredient image
 */
export async function deleteIngredientImage({
  userId,
  ingredientId,
}: {
  userId: string;
  ingredientId: string;
}): Promise<boolean> {
  // Verify ingredient exists and belongs to user
  await getIngredientById({ ingredientId, userId });

  const db = (await import("~/server/database/transaction")).getPrismaClient();

  // Find and delete ingredient_files record (soft delete only, no S3 deletion)
  const ingredientFile = await db.ingredient_files.findFirst({
    where: { ingredientId },
  });

  if (ingredientFile) {
    await db.ingredient_files.delete({
      where: { id: ingredientFile.id },
    });
  }

  return true;
}

