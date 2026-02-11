import {
  uploadFileToS3,
  validateFileSize,
  validateImageFile,
  checkFileExistsInS3,
  generatePresignedPost,
} from "~/lib/s3";
import {
  fileRepository,
  type FileEntity,
} from "~/server/repositories/file.repository";
import { InvalidInputError } from "../errors";
import { env } from "~/config/env";
import { type FileUploadType } from "generated/gql/graphql";

export interface UploadFileParams {
  file: Buffer;
  filename: string;
  mimeType: string;
  uploaderId: string;
}

/**
 * Upload a file to S3 and create database record
 */
export async function uploadFile({
  file,
  filename,
  mimeType,
  uploaderId,
}: UploadFileParams): Promise<FileEntity> {
  // Validate file type
  if (!validateImageFile(mimeType)) {
    throw InvalidInputError(
      "Only image files are allowed (JPEG, PNG, GIF, WebP)",
    );
  }

  // Validate file size (5MB max)
  if (!validateFileSize(file.length, 5)) {
    throw InvalidInputError("File size must be less than 5MB");
  }

  // Upload to S3
  const s3Result = await uploadFileToS3({
    file,
    filename,
    mimeType,
    folder: "recipe-images",
  });

  // Create database record
  const fileEntity = await fileRepository.create({
    key: s3Result.key,
    bucket: env.AWS_S3_BUCKET,
    region: env.AWS_REGION,
    filename: s3Result.filename,
    mimeType: s3Result.mimeType,
    size: s3Result.size,
    uploaderId,
  });

  return fileEntity;
}

/**
 * Soft delete a file from database (does not delete from S3)
 */
export async function deleteFile(fileId: string): Promise<void> {
  const file = await fileRepository.findById({ fileId });

  if (!file) {
    return;
  }

  // Soft delete from database only
  await fileRepository.softDelete({ fileId });
}

/**
 * Validate that a file has been uploaded to S3
 * Throws an error if the file doesn't exist in the database or hasn't been uploaded to S3
 */
export async function validateFileUploaded({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}): Promise<FileEntity> {
  // Check if file exists in database
  const file = await fileRepository.findById({ fileId });

  if (!file) {
    throw InvalidInputError("File not found");
  }

  // Verify the file belongs to the user
  if (file.uploaderId !== userId) {
    throw InvalidInputError("You don't have permission to use this file");
  }

  // Check if file exists in S3
  const existsInS3 = await checkFileExistsInS3({
    key: file.key,
    bucket: file.bucket,
    region: file.region,
  });

  if (!existsInS3) {
    throw InvalidInputError(
      "File has not been uploaded yet. Please complete the upload before saving.",
    );
  }

  return file;
}

/**
 * Upload file - creates file record and returns presigned URL
 * This is a generic upload that works for any file type
 * Client will upload directly to S3 using the presigned URL
 */
export async function uploadFilePresigned({
  userId,
  filename,
  mimeType,
  type,
}: {
  userId: string;
  filename: string;
  mimeType: string;
  type: FileUploadType;
}): Promise<{
  file: FileEntity;
  presignedPost: {
    url: string;
    fields: Record<string, string>;
    key: string;
  };
}> {
  // Validate file type
  if (!validateImageFile(mimeType)) {
    throw InvalidInputError(
      "Only image files are allowed (JPEG, PNG, GIF, WebP)",
    );
  }

  // Determine folder based on type
  const folderMap: Record<string, string> = {
    RECIPE: "recipe-images",
    RECIPE_GROUP: "recipe-group-images",
    INGREDIENT: "ingredient-images",
  };

  const folder = folderMap[type];

  // Generate presigned URL
  const presignedPost = await generatePresignedPost({
    folder,
    filename,
    mimeType,
    maxSizeMB: 5,
  });

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

  return {
    file,
    presignedPost,
  };
}
