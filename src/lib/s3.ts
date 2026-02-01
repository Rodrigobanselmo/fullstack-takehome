import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "crypto";
import { env } from "~/config/env";

// Initialize S3 Client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = env.AWS_S3_BUCKET;

export interface UploadFileParams {
  file: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Upload a file to S3
 */
export async function uploadFileToS3({
  file,
  filename,
  mimeType,
  folder = "uploads",
}: UploadFileParams): Promise<UploadFileResult> {
  // Generate unique key
  const ext = filename.split(".").pop();
  const uniqueFilename = `${randomUUID()}.${ext}`;
  const key = `${folder}/${uniqueFilename}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Generate public URL
  const url = `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    key,
    url,
    filename,
    mimeType,
    size: file.length,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a presigned URL for temporary access to a file
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Validate file type (images only)
 */
export function validateImageFile(mimeType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(size: number, maxSizeMB = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

export interface PresignedPostResult {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * Generate a presigned POST URL for direct client uploads
 * This allows clients to upload directly to S3 without going through the server
 */
export async function generatePresignedPost({
  folder = "uploads",
  filename,
  mimeType,
  maxSizeMB = 5,
}: {
  folder?: string;
  filename: string;
  mimeType: string;
  maxSizeMB?: number;
}): Promise<PresignedPostResult> {
  // Validate file type
  if (!validateImageFile(mimeType)) {
    throw new Error(
      "Only image files are allowed (JPEG, PNG, GIF, WebP)",
    );
  }

  // Generate unique key
  const ext = filename.split(".").pop();
  const uniqueFilename = `${randomUUID()}.${ext}`;
  const key = `${folder}/${uniqueFilename}`;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Create presigned POST
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: BUCKET_NAME,
    Key: key,
    Conditions: [
      ["content-length-range", 0, maxSizeBytes], // Max file size
      ["eq", "$Content-Type", mimeType], // Exact content type match
    ],
    Fields: {
      "Content-Type": mimeType,
    },
    Expires: 600, // URL expires in 10 minutes
  });

  return {
    url,
    fields,
    key,
  };
}

/**
 * URL Helper Functions
 * Best practice: Don't store URLs in database, construct them dynamically
 */

export interface FileData {
  key: string;
  bucket: string;
  region: string;
}

/**
 * Get public S3 URL (use only if bucket is public)
 */
export function getPublicS3Url(file: FileData): string {
  const bucket = file.bucket || BUCKET_NAME;
  const region = file.region || env.AWS_REGION;

  return `https://${bucket}.s3.${region}.amazonaws.com/${file.key}`;
}

/**
 * Get presigned URL for secure, temporary access (RECOMMENDED)
 *
 * @param file - File data with key and optional bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL that expires after specified time
 */
export async function getPresignedDownloadUrl(
  file: FileData,
  expiresIn = 3600, // 1 hour default
): Promise<string> {
  const bucket = file.bucket || BUCKET_NAME;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: file.key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}