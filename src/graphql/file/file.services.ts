import {
  uploadFileToS3,
  validateFileSize,
  validateImageFile,
} from "~/lib/s3";
import {
  fileRepository,
  type FileEntity,
} from "~/server/repositories/file.repository";
import { InvalidInputError } from "../errors";
import { env } from "~/config/env";

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

