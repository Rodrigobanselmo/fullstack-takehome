import type {
  AddRecipesToGroupInput,
  CreateRecipeGroupInput,
  RemoveRecipesFromGroupInput,
  UpdateRecipeGroupInput,
} from "generated/gql/graphql";
import { env } from "~/config/env";
import { deleteFile, uploadFile } from "~/graphql/file/file.services";
import { generatePresignedPost } from "~/lib/s3";
import { withTransaction } from "~/server/database/transaction";
import {
  fileRepository,
  type FileEntity,
} from "~/server/repositories/file.repository";
import {
  recipeGroupRepository,
  type RecipeGroupEntity,
} from "~/server/repositories/recipe-group.repository";
import { RecipeGroupNotFoundError } from "./recipe-group.errors";

export async function getRecipeGroupsByUserId({
  userId,
}: {
  userId: string;
}): Promise<RecipeGroupEntity[]> {
  return recipeGroupRepository.findManyByUserId({ userId });
}

export async function getRecipeGroupById({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<RecipeGroupEntity> {
  const group = await recipeGroupRepository.findById({ groupId, userId });

  if (!group) {
    throw RecipeGroupNotFoundError();
  }

  return group;
}

export async function createRecipeGroup({
  userId,
  input,
}: {
  userId: string;
  input: CreateRecipeGroupInput;
}): Promise<RecipeGroupEntity> {
  return recipeGroupRepository.create({
    name: input.name,
    description: input.description ?? undefined,
    userId,
    recipeIds: input.recipeIds ?? undefined,
  });
}

export async function updateRecipeGroup({
  userId,
  groupId,
  input,
}: {
  userId: string;
  groupId: string;
  input: UpdateRecipeGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  return recipeGroupRepository.update({
    groupId,
    userId,
    name: input.name ?? undefined,
    description: input.description ?? undefined,
  });
}

export async function deleteRecipeGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}): Promise<string> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  await recipeGroupRepository.softDelete({ groupId, userId });
  return groupId;
}

export async function addRecipesToGroup({
  userId,
  input,
}: {
  userId: string;
  input: AddRecipesToGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId: input.groupId, userId });

  return recipeGroupRepository.addRecipes({
    groupId: input.groupId,
    userId,
    recipeIds: input.recipeIds,
  });
}

export async function removeRecipesFromGroup({
  userId,
  input,
}: {
  userId: string;
  input: RemoveRecipesFromGroupInput;
}): Promise<RecipeGroupEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId: input.groupId, userId });

  return recipeGroupRepository.removeRecipes({
    groupId: input.groupId,
    userId,
    recipeIds: input.recipeIds,
  });
}

/**
 * Upload image for recipe group (replaces existing if any)
 */
export async function uploadRecipeGroupImage({
  groupId,
  userId,
  file,
  filename,
  mimeType,
}: {
  groupId: string;
  userId: string;
  file: Buffer;
  filename: string;
  mimeType: string;
}): Promise<FileEntity> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  // Get existing file IDs for group
  const existingFileIds =
    await recipeGroupRepository.findFileIdsByRecipeGroupId({ groupId });

  // Use transaction to ensure atomicity
  return withTransaction(async () => {
    // Upload new file
    const newFile = await uploadFile({
      file,
      filename,
      mimeType,
      uploaderId: userId,
    });

    // Attach to group
    await recipeGroupRepository.attachFileToRecipeGroup({
      groupId,
      fileId: newFile.id,
    });

    // Delete old files (if any)
    for (const oldFileId of existingFileIds) {
      await recipeGroupRepository.detachFileFromRecipeGroup({
        groupId,
        fileId: oldFileId,
      });
    }

    return newFile;
  });
}

/**
 * Delete recipe group image
 */
export async function deleteRecipeGroupImage({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<void> {
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  const fileIds = await recipeGroupRepository.findFileIdsByRecipeGroupId({
    groupId,
  });

  for (const fileId of fileIds) {
    await recipeGroupRepository.detachFileFromRecipeGroup({ groupId, fileId });
    await deleteFile(fileId);
  }
}

/**
 * Upload recipe group image - creates file record and returns presigned URL
 * Client will upload directly to S3 using the presigned URL
 */
export async function uploadRecipeGroupImagePresigned({
  groupId,
  userId,
  filename,
  mimeType,
}: {
  groupId: string;
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
  // Verify group exists and belongs to user
  await getRecipeGroupById({ groupId, userId });

  // Generate presigned URL
  const presignedPost = await generatePresignedPost({
    folder: "recipe-images",
    filename,
    mimeType,
    maxSizeMB: 5,
  });

  // Get existing file IDs for group
  const existingFileIds =
    await recipeGroupRepository.findFileIdsByRecipeGroupId({ groupId });

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

    // Attach to group
    await recipeGroupRepository.attachFileToRecipeGroup({
      groupId,
      fileId: file.id,
    });

    // Soft delete old files (if any)
    for (const oldFileId of existingFileIds) {
      await recipeGroupRepository.detachFileFromRecipeGroup({
        groupId,
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
